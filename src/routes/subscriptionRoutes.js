// FILE: src/routes/subscriptionRoutes.js
// ==========================================
import express from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getUserSubscription,
  getAllUserSubscriptions,
  createSubscription,
  cancelSubscription,
  getUserPayments,
  getAllPayments,
  handleStripeWebhook,
  getSubscriptionStats
} from '../controllers/subscriptionController.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get('/plans', getAllPlans);
router.get('/plans/:id', getPlanById);

// ========== STRIPE WEBHOOK (NO AUTH) ==========
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ========== AUTHENTICATED USER ROUTES ==========

// User's subscription management
router.get('/my-subscription', getUserSubscription);
router.get('/my-subscriptions', getAllUserSubscriptions);
router.post('/subscribe', createSubscription);
router.delete('/subscriptions/:id', cancelSubscription);

// User's payment history
router.get('/my-payments', getUserPayments);

// ========== ADMIN ONLY ROUTES ==========

// Plan management
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// All payments (admin)
router.get('/payments', getAllPayments);

// Analytics
router.get('/stats', getSubscriptionStats);

export default router;