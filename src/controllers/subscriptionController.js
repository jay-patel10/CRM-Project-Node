// ==========================================
// FILE: src/controllers/subscriptionController.js (COMPLETE FILE)
// ==========================================
import subscriptionService from '../services/subscriptionService.js';
import stripe from '../config/stripe.js';

// ========== PLANS ==========
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (important!)
      sig,
      endpointSecret
    );

    console.log('📥 [Stripe] Webhook received:', event.type);
  } catch (err) {
    console.error('❌ [Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
  await subscriptionService.handleStripeEvent(event);
  res.json({ received: true });
} catch (error) {
  console.error('❌ [Stripe] Webhook processing failed:', error);
  res.status(500).json({ success: false, message: error.message });
}

};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    console.log('📥 Received plan data:', req.body);
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error('❌ Create plan error:', error.message);
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

// ========== SUBSCRIPTIONS ==========

export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const sub = await subscriptionService.getUserSubscription(userId);
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { planId, userId } = req.body;
    
    console.log('💳 Creating payment intent for user:', userId, 'plan:', planId);
    
    if (!planId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan ID is required' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const result = await subscriptionService.createPaymentIntent(userId, planId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Payment intent error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { subscriptionId, paymentIntentId, userId } = req.body;
    
    if (!subscriptionId || !paymentIntentId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID, Payment Intent ID, and User ID are required' 
      });
    }

    const result = await subscriptionService.confirmPayment(
      userId, 
      subscriptionId, 
      paymentIntentId
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Confirm payment error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const sub = await subscriptionService.cancelSubscription(userId, req.params.id);
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========== NEW: TOGGLE AUTO-RENEW ==========

export const toggleAutoRenew = async (req, res) => {
  try {
    const { subscriptionId, userId, autoRenew } = req.body;
    
    console.log('📥 Toggle auto-renew request:', req.body);
    
    if (!subscriptionId || !userId || autoRenew === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID, User ID, and autoRenew status are required' 
      });
    }

    const subscription = await subscriptionService.toggleAutoRenew(
      userId, 
      subscriptionId, 
      autoRenew
    );
    
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('❌ Toggle auto-renew error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========== PAYMENTS ==========

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const payments = await subscriptionService.getUserPayments(userId, req.query);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await subscriptionService.getAllPayments(req.query);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== NEW: ADMIN - GET ALL SUBSCRIPTIONS ==========

export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, planId, userId } = req.query;
    
    console.log('📊 Admin fetching all subscriptions with filters:', req.query);
    
    const subscriptions = await subscriptionService.getAllSubscriptions({
      status,
      planId: planId ? parseInt(planId) : undefined,
      userId: userId ? parseInt(userId) : undefined
    });
    
    console.log(`✅ Found ${subscriptions.length} subscriptions`);
    
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('❌ Get all subscriptions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== NEW: ADMIN - CANCEL ANY SUBSCRIPTION ==========

export const adminCancelSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    
    console.log('🔴 Admin cancelling subscription:', subscriptionId);
    
    const subscription = await subscriptionService.adminCancelSubscription(subscriptionId);
    
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('❌ Admin cancel error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========== NEW: ADMIN - TOGGLE AUTO-RENEW FOR ANY USER ==========

export const adminToggleAutoRenew = async (req, res) => {
  try {
    const { subscriptionId, autoRenew } = req.body;
    
    console.log('🔄 Admin toggling auto-renew:', { subscriptionId, autoRenew });
    
    if (!subscriptionId || autoRenew === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID and autoRenew status are required' 
      });
    }

    const subscription = await subscriptionService.adminToggleAutoRenew(
      subscriptionId, 
      autoRenew
    );
    
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('❌ Admin toggle auto-renew error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};