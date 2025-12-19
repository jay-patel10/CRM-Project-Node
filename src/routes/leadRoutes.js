import express from 'express'
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadStatuses,
  getMyLeads
} from '../controllers/leadController.js'

import {
  protect,
  authorizeRoles,
  authorizePermissions,
  authorizeOwnerOrAdmin,
  authorizeRoleOrPermission
} from '../middleware/auth.js'

const router = express.Router()

/*
  ROLE IDs:
  1 = Admin
  2 = Manager
  3 = User

  PERMISSIONS:
  - leads.read
  - leads.create
  - leads.update
  - leads.delete
*/

// ------------------------------------
// 🔐 All Lead APIs must be authenticated
// ------------------------------------
router.use(protect)

// ------------------------------------
// 📌 Lead Statuses – Anyone who can read leads
// ------------------------------------
router.get(
  '/statuses',
  authorizePermissions('leads.read'),
  getLeadStatuses
)

// ------------------------------------
// 📌 My Leads – Any logged-in user
// ------------------------------------
router.get(
  '/my',
  getMyLeads
)

// ------------------------------------
// 📌 Get All Leads – Permission based
// ------------------------------------
router.get(
  '/',
  authorizePermissions('leads.read'),
  getLeads
)

// ------------------------------------
// 📌 Create Lead – Admin / Manager OR leads.create
// ------------------------------------
router.post(
  '/',
  authorizeRoleOrPermission([1, 2], ['leads.create']),
  createLead
)

// ------------------------------------
// 📌 Get Lead by ID – Owner, Admin OR leads.read
// ------------------------------------
router.get(
  '/:id',
  authorizeOwnerOrAdmin,
  getLeadById
)

// ------------------------------------
// 📌 Update Lead – Owner, Admin OR leads.update
// ------------------------------------
router.put(
  '/:id',
  authorizeOwnerOrAdmin,
  updateLead
)

// ------------------------------------
// 📌 Delete Lead – Admin OR leads.delete
// ------------------------------------
router.delete(
  '/:id',
  authorizeRoleOrPermission([1], ['leads.delete']),
  deleteLead
)

export default router
