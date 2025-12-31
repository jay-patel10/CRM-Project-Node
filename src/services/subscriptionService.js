// ==========================================
// FILE: src/services/subscriptionService.js (COMPLETE FILE)
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
    try {
      console.log('🔄 Creating plan with data:', planData);

      if (!planData.name || !planData.price) {
        throw new Error('Name and price are required');
      }

      const priceAmount = typeof planData.price === 'string' 
        ? parseFloat(planData.price) 
        : planData.price;

      console.log('💰 Price amount:', priceAmount);

      // Create Stripe Product
      const stripeProduct = await stripe.products.create({
        name: planData.name,
        description: planData.description || '',
        metadata: {
          billingCycle: planData.billingCycle || 'monthly'
        }
      });

      console.log('✅ Stripe product created:', stripeProduct.id);

      // Create Stripe Price
      const stripePriceData = {
        unit_amount: Math.round(priceAmount * 100),
        currency: (planData.currency || 'INR').toLowerCase(),
        product: stripeProduct.id
      };

      if (planData.billingCycle !== 'lifetime') {
        stripePriceData.recurring = {
          interval: planData.billingCycle === 'yearly' ? 'year' : 'month'
        };
      }

      console.log('📤 Sending price to Stripe:', stripePriceData);

      const stripePrice = await stripe.prices.create(stripePriceData);

      console.log('✅ Stripe price created:', stripePrice.id);

      // Save to database
      const dbData = {
        name: planData.name,
        description: planData.description || '',
        price: priceAmount,
        currency: planData.currency || 'INR',
        billingCycle: planData.billingCycle || 'monthly',
        features: Array.isArray(planData.features) ? planData.features : [],
        stripePriceId: stripePrice.id,
        isActive: planData.isActive !== undefined ? planData.isActive : true
      };

      console.log('💾 Saving to database:', dbData);

      const plan = await SubscriptionPlan.create(dbData);

      console.log('✅ Plan created successfully:', plan.id);

      return plan;
    } catch (error) {
      console.error('❌ Error in createPlan:', error);
      throw error;
    }
  }

  async updatePlan(planId, updateData) {
    const plan = await this.getPlanById(planId);
    
    try {
      if (updateData.price && updateData.price !== parseFloat(plan.price)) {
        const stripeProduct = await stripe.products.create({
          name: updateData.name || plan.name,
          description: updateData.description || plan.description,
          metadata: {
            billingCycle: updateData.billingCycle || plan.billingCycle
          }
        });

        const priceAmount = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : updateData.price;

        const stripePriceData = {
          unit_amount: Math.round(priceAmount * 100),
          currency: (updateData.currency || plan.currency).toLowerCase(),
          product: stripeProduct.id
        };

        if ((updateData.billingCycle || plan.billingCycle) !== 'lifetime') {
          stripePriceData.recurring = {
            interval: (updateData.billingCycle || plan.billingCycle) === 'yearly' ? 'year' : 'month'
          };
        }

        const stripePrice = await stripe.prices.create(stripePriceData);
        updateData.stripePriceId = stripePrice.id;
      }

      await plan.update(updateData);
      return plan;
    } catch (error) {
      console.error('❌ Error in updatePlan:', error);
      throw error;
    }
  }

  async deletePlan(planId) {
    const plan = await this.getPlanById(planId);
    
    const activeCount = await Subscription.count({
      where: { planId, status: 'active' }
    });

    if (activeCount > 0) {
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
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['createdAt', 'DESC']]
    });
  }

  async createPaymentIntent(userId, planId) {
    const plan = await this.getPlanById(planId);
    const user = await User.findByPk(userId);

    if (!user) throw new Error('User not found');

    const existing = await this.getUserSubscription(userId);
    if (existing && existing.status === 'active') {
      throw new Error('User already has an active subscription');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100),
      currency: plan.currency.toLowerCase(),
      metadata: {
        userId: user.id,
        planId: plan.id,
        userEmail: user.email
      }
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    const subscription = await Subscription.create({
      userId,
      planId,
      status: 'pending',
      startDate,
      endDate,
      stripeSubscriptionId: paymentIntent.id,
      autoRenew: false
    });

    await Payment.create({
      userId,
      subscriptionId: subscription.id,
      amount: plan.price,
      currency: plan.currency,
      gateway: 'stripe',
      gatewayTransactionId: paymentIntent.id,
      status: 'pending',
      metadata: { planName: plan.name }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      paymentIntentId: paymentIntent.id
    };
  }

  async confirmPayment(userId, subscriptionId, paymentIntentId) {
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) throw new Error('Subscription not found');

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await subscription.update({ status: 'active' });

      await Payment.update(
        { status: 'success' },
        { 
          where: { 
            subscriptionId: subscription.id,
            gatewayTransactionId: paymentIntentId
          }
        }
      );

      return { success: true, subscription };
    } else {
      throw new Error('Payment not completed');
    }
  }

  async cancelSubscription(userId, subscriptionId) {
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) throw new Error('Subscription not found');
    if (subscription.status === 'cancelled') {
      throw new Error('Already cancelled');
    }

    await subscription.update({ status: 'cancelled', autoRenew: false });
    return subscription;
  }

  // ========== NEW: TOGGLE AUTO-RENEW ==========
  async toggleAutoRenew(userId, subscriptionId, autoRenew) {
    console.log('🔄 Toggling auto-renew:', { userId, subscriptionId, autoRenew });
    
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) throw new Error('Subscription not found');
    
    await subscription.update({ autoRenew });
    
    console.log('✅ Auto-renew updated successfully');
    
    return subscription;
  }

  // ========== PAYMENTS ==========

  async getUserPayments(userId, filters = {}) {
    const where = { userId };
    if (filters.status) where.status = filters.status;

    return await Payment.findAll({
      where,
      include: [{
        model: Subscription,
        as: 'subscription',
        include: [{ model: SubscriptionPlan, as: 'plan' }]
      }],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50
    });
  }

  async getAllPayments(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;

    return await Payment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name'] // Use 'name' as per your schema
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

  // ========== NEW: GET ALL SUBSCRIPTIONS (ADMIN) ==========
  async getAllSubscriptions(filters = {}) {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.planId) where.planId = filters.planId;
    if (filters.userId) where.userId = filters.userId;

    console.log('📊 Fetching all subscriptions with filters:', filters);

    return await Subscription.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          // Use the EXACT column names from your users table
          attributes: ['id', 'email', 'name'] // Change if your column is different
        },
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // ========== NEW: ADMIN CANCEL ANY SUBSCRIPTION ==========
  async adminCancelSubscription(subscriptionId) {
    const subscription = await Subscription.findByPk(subscriptionId);

    if (!subscription) throw new Error('Subscription not found');
    if (subscription.status === 'cancelled') {
      throw new Error('Already cancelled');
    }

    await subscription.update({ status: 'cancelled', autoRenew: false });
    return subscription;
  }

  // ========== NEW: ADMIN TOGGLE AUTO-RENEW ==========
  async adminToggleAutoRenew(subscriptionId, autoRenew) {
    const subscription = await Subscription.findByPk(subscriptionId);

    if (!subscription) throw new Error('Subscription not found');
    
    await subscription.update({ autoRenew });
    
    return subscription;
  }
}

export default new SubscriptionService();