// ==========================================
// FILE: src/routes/subscriptionRoutes.js (COMPLETE FILE)
// ==========================================
import express from 'express';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getUserSubscription,
  createPaymentIntent,
  confirmPayment,
  cancelSubscription,
  getUserPayments,
  getAllPayments,
  toggleAutoRenew,
  getAllSubscriptions,
  adminCancelSubscription,
  adminToggleAutoRenew,
  handleStripeWebhook
} from '../controllers/subscriptionController.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.get('/plans', getAllPlans);

// ===== USER ROUTES (Authenticated) =====

// User subscription management
router.get('/my-subscription', getUserSubscription);
router.post('/subscribe', createPaymentIntent);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);
router.delete('/subscriptions/:id', cancelSubscription);

// User toggle auto-renew
router.put('/toggle-auto-renew', toggleAutoRenew);

// User payment history
router.get('/my-payments', getUserPayments);

// ===== ADMIN ROUTES =====

// Plan management
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// All payments (admin)
router.get('/payments', getAllPayments);

// All subscriptions (admin)
router.get('/all-subscriptions', getAllSubscriptions);

// Admin cancel any subscription
router.delete('/admin/subscriptions/:id', adminCancelSubscription);

// Admin toggle auto-renew for any user
router.put('/admin/toggle-auto-renew', adminToggleAutoRenew);

// Stripe webhook (MUST be BEFORE authenticate middleware!)
router.post('/stripe/webhook', handleStripeWebhook);

export default router;