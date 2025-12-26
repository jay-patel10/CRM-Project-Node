
// ==========================================
// FILE: src/services/subscriptionService.js
// ==========================================
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import stripe from '../config/stripe.js';
import { Op } from 'sequelize';

class SubscriptionService {
  // ========== SUBSCRIPTION PLANS ==========
  
  async getAllPlans() {
    return await SubscriptionPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    });
  }

  async getPlanById(planId) {
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) throw new Error('Plan not found');
    return plan;
  }

  async createPlan(planData) {
    // Create Stripe price first
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(planData.price * 100), // Convert to cents
      currency: planData.currency.toLowerCase(),
      recurring: {
        interval: planData.billingCycle === 'yearly' ? 'year' : 'month'
      },
      product_data: {
        name: planData.name,
        description: planData.description
      }
    });

    return await SubscriptionPlan.create({
      ...planData,
      stripePriceId: stripePrice.id
    });
  }

  async updatePlan(planId, updateData) {
    const plan = await this.getPlanById(planId);
    
    // If price changed, create new Stripe price
    if (updateData.price && updateData.price !== parseFloat(plan.price)) {
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(updateData.price * 100),
        currency: updateData.currency?.toLowerCase() || 'inr',
        recurring: {
          interval: updateData.billingCycle === 'yearly' ? 'year' : 'month'
        },
        product_data: {
          name: updateData.name || plan.name,
          description: updateData.description || plan.description
        }
      });
      updateData.stripePriceId = stripePrice.id;
    }

    await plan.update(updateData);
    return plan;
  }

  async deletePlan(planId) {
    const plan = await this.getPlanById(planId);
    
    // Check if any active subscriptions exist
    const activeSubscriptions = await Subscription.count({
      where: { 
        planId,
        status: 'active'
      }
    });

    if (activeSubscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    await plan.update({ isActive: false });
    return { message: 'Plan deactivated successfully' };
  }

  // ========== USER SUBSCRIPTIONS ==========

  async getUserSubscription(userId) {
    return await Subscription.findOne({
      where: { 
        userId,
        status: { [Op.in]: ['active', 'pending'] }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async getAllUserSubscriptions(userId) {
    return await Subscription.findAll({
      where: { userId },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async createSubscription(userId, planId) {
    const plan = await this.getPlanById(planId);
    const user = await User.findByPk(userId);

    if (!user) throw new Error('User not found');

    // Check for existing active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('User already has an active subscription');
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: user.id }
      });
      stripeCustomerId = customer.id;
      await user.update({ stripeCustomerId });
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 100); // Lifetime
    }

    // Create subscription record
    const subscription = await Subscription.create({
      userId,
      planId,
      status: 'pending',
      startDate,
      endDate,
      stripeSubscriptionId: stripeSubscription.id,
      autoRenew: true
    });

    return {
      subscription,
      clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: stripeSubscription.id
    };
  }

  async cancelSubscription(userId, subscriptionId) {
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) throw new Error('Subscription not found');
    if (subscription.status === 'cancelled') {
      throw new Error('Subscription already cancelled');
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await subscription.update({
      status: 'cancelled',
      autoRenew: false
    });

    return subscription;
  }

  async handleStripeWebhook(event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
    }
  }

  async handlePaymentSucceeded(invoice) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (!subscription) return;

    await subscription.update({ status: 'active' });

    await Payment.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      gateway: 'stripe',
      gatewayTransactionId: invoice.payment_intent,
      status: 'success',
      metadata: { invoiceId: invoice.id }
    });
  }

  async handlePaymentFailed(invoice) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (!subscription) return;

    await Payment.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      gateway: 'stripe',
      gatewayTransactionId: invoice.payment_intent,
      status: 'failed',
      metadata: { invoiceId: invoice.id }
    });
  }

  async handleSubscriptionUpdated(stripeSubscription) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (!subscription) return;

    const status = stripeSubscription.status === 'active' ? 'active' : 'pending';
    await subscription.update({ status });
  }

  async handleSubscriptionDeleted(stripeSubscription) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (!subscription) return;

    await subscription.update({ 
      status: 'cancelled',
      autoRenew: false
    });
  }

  // ========== PAYMENT HISTORY ==========

  async getUserPayments(userId, filters = {}) {
    const where = { userId };

    if (filters.status) where.status = filters.status;
    if (filters.gateway) where.gateway = filters.gateway;

    return await Payment.findAll({
      where,
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [{ model: SubscriptionPlan, as: 'plan' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50
    });
  }

  async getAllPayments(filters = {}) {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.gateway) where.gateway = filters.gateway;
    if (filters.userId) where.userId = filters.userId;

    return await Payment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fullName']
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [{ model: SubscriptionPlan, as: 'plan' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 100
    });
  }

  // ========== ANALYTICS ==========

  async getSubscriptionStats() {
    const totalActive = await Subscription.count({
      where: { status: 'active' }
    });

    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'success' }
    });

    const monthlyRevenue = await Payment.sum('amount', {
      where: {
        status: 'success',
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    const planDistribution = await Subscription.findAll({
      attributes: [
        'planId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { status: 'active' },
      group: ['planId'],
      include: [{ model: SubscriptionPlan, as: 'plan' }]
    });

    return {
      totalActive,
      totalRevenue: totalRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      planDistribution
    };
  }
}

export default new SubscriptionService();