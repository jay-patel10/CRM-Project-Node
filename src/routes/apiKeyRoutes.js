import express from 'express';
import {
  getApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  regenerateApiKey
} from '../controllers/apiKeyController.js';

import {
  protect,
  authorizeRoleOrPermission
} from '../middleware/auth.js';

const router = express.Router();

// ============================
// All routes require authentication
// ============================
router.use(protect);

// ============================
// GET ALL API KEYS
// ============================
router.get('/', getApiKeys);

// ============================
// CREATE API KEY
// ============================
router.post(
  '/',
  authorizeRoleOrPermission([1, 2], ['api_keys.create']),
  createApiKey
);

// ============================
// GET API KEY BY ID
// ============================
router.get('/:id', getApiKeyById);

// ============================
// UPDATE API KEY
// ============================
router.put(
  '/:id',
  authorizeRoleOrPermission([1, 2], ['api_keys.update']),
  updateApiKey
);

// ============================
// TOGGLE API KEY STATUS
// ============================
router.patch(
  '/:id/toggle',
  authorizeRoleOrPermission([1, 2], ['api_keys.update']),
  toggleApiKeyStatus
);

// ============================
// REGENERATE API KEY
// ============================
router.post(
  '/:id/regenerate',
  authorizeRoleOrPermission([1, 2], ['api_keys.update']),
  regenerateApiKey
);

// ============================
// DELETE API KEY
// ============================
router.delete(
  '/:id',
  authorizeRoleOrPermission([1], ['api_keys.delete']),
  deleteApiKey
);

export default router;