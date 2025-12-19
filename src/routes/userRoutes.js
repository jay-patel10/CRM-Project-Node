import express from 'express'
import UserController from '../controllers/userController.js'
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
  - users.read (list/view users)
  - users.create (create users)
  - users.update (update users)
  - users.delete (delete users)
*/

// ============================
// LIST USERS - Permission Based
// ============================
router.get(
  '/',
  protect,
  authorizePermissions('users.read'), // Anyone with users.read permission
  UserController.getAllUsers
)

// ============================
// CREATE USER - Admin/Manager OR users.create permission
// ============================
router.post(
  '/',
  protect,
  authorizeRoleOrPermission([1, 2], ['users.create']),
  UserController.createUser
)

// ============================
// BULK DELETE - Admin only
// ============================
router.post(
  '/bulk-delete',
  protect,
  authorizeRoles(1), // Admin only
  UserController.bulkDeleteUsers
)

// ============================
// DELETE USER - Admin OR users.delete permission
// ============================
router.delete(
  '/:id',
  protect,
  authorizeRoleOrPermission([1], ['users.delete']),
  UserController.deleteUser
)

// ============================
// GET USER BY ID - Owner, Admin, OR users.read permission
// ============================
router.get(
  '/:id',
  protect,
  authorizeOwnerOrAdmin,
  UserController.getUserById
)

// ============================
// UPDATE USER - Owner, Admin, OR users.update permission
// ============================
router.put(
  '/:id',
  protect,
  authorizeOwnerOrAdmin,
  UserController.updateUser
)

export default router