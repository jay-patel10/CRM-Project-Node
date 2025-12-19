import Role from '../models/Role.js'
import User from '../models/User.js'
import Permission from '../models/Permission.js'
import RolePermission from '../models/RolePermission.js'

class RoleService {
  // -----------------------------------------
  // GET ALL ROLES (with user count)
  // -----------------------------------------
  async getRoles() {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    const rolesWithCounts = await Promise.all(
      roles.map(async role => {
        const userCount = await User.count({ where: { roleId: role.id } })

        return {
          ...role.toJSON(),
          userCount
        }
      })
    )

    return rolesWithCounts
  }

  // -----------------------------------------
  // GET ROLE BY ID (WITH PERMISSIONS)
  // -----------------------------------------
  async getRoleById(id) {
    const role = await Role.findByPk(id, {
      attributes: ['id', 'name', 'description', 'isActive'],
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'key', 'name'],
          through: { attributes: [] }
        }
      ]
    })

    if (!role) throw new Error('Role not found')

    const userCount = await User.count({ where: { roleId: role.id } })

    return {
      ...role.toJSON(),
      userCount
    }
  }

  // -----------------------------------------
  // CREATE ROLE (WITH PERMISSIONS)
  // -----------------------------------------
  async createRole(data) {
    const { name, description, permissionIds = [], isActive } = data

    if (!name) throw new Error('Role name is required')

    const exists = await Role.findOne({ where: { name } })
    if (exists) throw new Error('Role with this name already exists')

    const role = await Role.create({
      name,
      description: description || null,
      isActive: isActive ?? true
    })

    // Attach permissions (if provided)
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        roleId: role.id,
        permissionId
      }))

      await RolePermission.bulkCreate(rolePermissions)
    }

    return role
  }

  // -----------------------------------------
  // UPDATE ROLE (WITH PERMISSIONS)
  // -----------------------------------------
  async updateRole(id, data) {
    const { name, description, permissionIds, isActive } = data

    const role = await Role.findByPk(id)
    if (!role) throw new Error('Role not found')

    if (name && name !== role.name) {
      const existing = await Role.findOne({ where: { name } })
      if (existing) throw new Error('Role with this name already exists')
    }

    await role.update({
      name: name ?? role.name,
      description: description ?? role.description,
      isActive: isActive ?? role.isActive
    })

    // Update permissions if provided
    if (Array.isArray(permissionIds)) {
      // Remove old permissions
      await RolePermission.destroy({ where: { roleId: id } })

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          roleId: id,
          permissionId
        }))

        await RolePermission.bulkCreate(rolePermissions)
      }
    }

    return role
  }

  // -----------------------------------------
  // DELETE ROLE
  // -----------------------------------------
  async deleteRole(id) {
    const role = await Role.findByPk(id)
    if (!role) throw new Error('Role not found')

    const userCount = await User.count({ where: { roleId: id } })
    if (userCount > 0) {
      throw new Error(`Cannot delete role. ${userCount} user(s) assigned.`)
    }

    // Clean RBAC relations
    await RolePermission.destroy({ where: { roleId: id } })

    await role.destroy()
    return true
  }
}

export default new RoleService()
