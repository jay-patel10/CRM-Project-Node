import jwt from 'jsonwebtoken'
import { User, Role, Permission } from '../models/index.js'

// ==================================================
// AUTH PROTECT MIDDLEWARE (JWT + LOAD ROLE + PERMS)
// ==================================================
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['id', 'key', 'name'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Attach to request
    req.user = user
    req.userPermissions =
      user.role?.permissions?.map(p => p.key.toLowerCase()) || []

    next()
  } catch (err) {
    console.error('AUTH MIDDLEWARE ERROR:', err.message)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

// ===================================
// ROLE-BASED ACCESS CONTROL
// ===================================
export const authorizeRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not authenticated'
      })
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User role missing'
      })
    }

    const userRoleId = req.user.roleId
    const userRoleName = req.user.role.name.toLowerCase()

    const ROLE_MAP = {
      admin: 1,
      manager: 2,
      user: 3
    }

    const allowedRoleIds = rolesAllowed
      .map(role => {
        if (typeof role === 'number') return role
        if (typeof role === 'string') return ROLE_MAP[role.toLowerCase()]
        return null
      })
      .filter(Boolean)

    const allowedRoleNames = rolesAllowed
      .filter(r => typeof r === 'string')
      .map(r => r.toLowerCase())

    const idMatch = allowedRoleIds.includes(userRoleId)
    const nameMatch = allowedRoleNames.includes(userRoleName)

    if (!idMatch && !nameMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role'
      })
    }

    next()
  }
}

// ===================================
// PERMISSION-BASED ACCESS CONTROL
// ===================================
export const authorizePermissions = (...permissionsRequired) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not authenticated'
      })
    }

    const userPermissions = req.userPermissions || []

    // Action synonyms for flexible matching
    const ACTION_SYNONYMS = {
      read: ['read', 'view', 'list'],
      view: ['view', 'read', 'list'],
      list: ['list', 'read', 'view'],
      edit: ['edit', 'update'],
      update: ['update', 'edit'],
      create: ['create', 'add'],
      delete: ['delete', 'remove']
    }

    const hasPermission = permissionsRequired.some(required => {
      const requiredLower = required.toLowerCase()

      // Exact match
      if (userPermissions.includes(requiredLower)) {
        return true
      }

      // Check with synonyms
      if (requiredLower.includes('.')) {
        const [module, action] = requiredLower.split('.')
        const synonyms = ACTION_SYNONYMS[action] || []

        return synonyms.some(a => userPermissions.includes(`${module}.${a}`))
      }

      // Check if user has any permission for the module
      return userPermissions.some(p => p.startsWith(`${requiredLower}.`))
    })

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient permissions'
      })
    }

    next()
  }
}

// ===================================
// REQUIRE ALL PERMISSIONS
// ===================================
export const authorizeAllPermissions = (...permissionsRequired) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not authenticated'
      })
    }

    const userPermissions = req.userPermissions || []

    const hasAllPermissions = permissionsRequired.every(p =>
      userPermissions.includes(p.toLowerCase())
    )

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Missing required permissions'
      })
    }

    next()
  }
}

// ============================
// OWNER OR ADMIN ACCESS
// ============================
export const authorizeOwnerOrAdmin = (req, res, next) => {
  try {
    const loggedInUser = req.user
    const targetUserId = Number(req.params.id)

    // Admin access (roleId 1)
    if (loggedInUser.roleId === 1) {
      return next()
    }

    // Owner access
    if (loggedInUser.id === targetUserId) {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized - Must be owner or admin'
    })
  } catch (err) {
    console.error('OWNER/AUTH ERROR:', err.message)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// ============================
// COMBINED: ROLE OR PERMISSION
// ============================
export const authorizeRoleOrPermission = (roles = [], permissions = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not authenticated'
      })
    }

    const userRoleId = req.user.roleId
    const userRoleName = req.user.role?.name?.toLowerCase()
    const userPermissions = req.userPermissions || []

    const ROLE_MAP = {
      admin: 1,
      manager: 2,
      user: 3
    }

    // Check roles
    const allowedRoleIds = roles
      .map(role => {
        if (typeof role === 'number') return role
        if (typeof role === 'string') return ROLE_MAP[role.toLowerCase()]
        return null
      })
      .filter(Boolean)

    const allowedRoleNames = roles
      .filter(r => typeof r === 'string')
      .map(r => r.toLowerCase())

    const hasRole =
      allowedRoleIds.includes(userRoleId) ||
      allowedRoleNames.includes(userRoleName)

    if (hasRole) {
      return next()
    }

    // Check permissions
    const hasPermission = permissions.some(required => {
      const requiredLower = required.toLowerCase()
      return userPermissions.includes(requiredLower)
    })

    if (hasPermission) {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied - Insufficient role or permissions'
    })
  }
}