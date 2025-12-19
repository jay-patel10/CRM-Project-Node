export const authorizeRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - User not authenticated'
      })
    }

    const userRoleId = req.user.roleId
    const userRoleName = req.user.role?.name?.toLowerCase()

    const roleMap = {
      admin: 1,
      manager: 2,
      user: 3
    }

    const allowedRoleIds = rolesAllowed
      .map(role =>
        typeof role === 'string'
          ? roleMap[role.toLowerCase()]
          : role
      )
      .filter(Boolean)

    const allowedRoleNames = rolesAllowed.map(r =>
      String(r).toLowerCase()
    )

    const isAllowed =
      allowedRoleIds.includes(userRoleId) ||
      allowedRoleNames.includes(userRoleName)

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role'
      })
    }

    next()
  }
}
