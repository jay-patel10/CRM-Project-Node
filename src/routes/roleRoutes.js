import express from 'express'
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/roleController.js'

import {
  protect,
  authorizeRoles,
  authorizePermissions,
  authorizeRoleOrPermission
} from '../middleware/auth.js'

const router = express.Router()

/*
  ROLE IDs:
  1 = Admin
  2 = Manager
  3 = User

  PERMISSIONS:
  - roles.read
  - roles.create
  - roles.update
  - roles.delete
*/

// ============================
// LIST ROLES – Permission based
// ============================
router.get(
  '/',
  protect,
  authorizePermissions('roles.read'),
  getRoles
)

// ============================
// GET ROLE BY ID – Permission based
// ============================
router.get(
  '/:id',
  protect,
  authorizePermissions('roles.read'),
  getRoleById
)

// ============================
// CREATE ROLE – Admin OR roles.create
// ============================
router.post(
  '/',
  protect,
  authorizeRoleOrPermission([1], ['roles.create']),
  createRole
)

// ============================
// UPDATE ROLE – Admin OR roles.update
// ============================
router.put(
  '/:id',
  protect,
  authorizeRoleOrPermission([1], ['roles.update']),
  updateRole
)

// ============================
// DELETE ROLE – Admin ONLY (recommended)
// ============================
router.delete(
  '/:id',
  protect,
  authorizeRoles(1),
  deleteRole
)

export default router
