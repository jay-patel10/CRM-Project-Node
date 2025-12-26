// ==========================================
// FILE: src/controllers/subscriptionController.js
// ==========================================
import subscriptionService from '../services/subscriptionService.js';
import stripe from '../config/stripe.js';

// ========== SUBSCRIPTION PLANS ==========

export const getAllPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await subscriptionService.getPlanById(req.params.id);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const result = await subscriptionService.deletePlan(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========== USER SUBSCRIPTIONS ==========

export const getUserSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(req.user.id);
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllUserSubscriptions(req.user.id);
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const result = await subscriptionService.createSubscription(req.user.id, planId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(
      req.user.id,
      req.params.id
    );
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========== PAYMENT HISTORY ==========

export const getUserPayments = async (req, res) => {
  try {
    const { status, gateway, limit } = req.query;
    const payments = await subscriptionService.getUserPayments(req.user.id, {
      status,
      gateway,
      limit: parseInt(limit) || 50
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { status, gateway, userId, limit } = req.query;
    const payments = await subscriptionService.getAllPayments({
      status,
      gateway,
      userId: userId ? parseInt(userId) : undefined,
      limit: parseInt(limit) || 100
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== STRIPE WEBHOOKS ==========

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await subscriptionService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== ANALYTICS ==========

export const getSubscriptionStats = async (req, res) => {
  try {
    const stats = await subscriptionService.getSubscriptionStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
