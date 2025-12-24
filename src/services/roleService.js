import Role from '../models/Role.js'
import User from '../models/User.js'
import Permission from '../models/Permission.js'
import RolePermission from '../models/RolePermission.js'
import sequelize from '../config/sequelize.js'

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

    // Use transaction
    const t = await sequelize.transaction()

    try {
      const role = await Role.create(
        {
          name,
          description: description || null,
          isActive: isActive ?? true
        },
        { transaction: t }
      )

      // Attach permissions (if provided)
      if (permissionIds.length > 0) {
        // ✅ Remove duplicates
        const uniquePermissionIds = [...new Set(permissionIds)]
        
        const rolePermissions = uniquePermissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId: Number(permissionId)
        }))

        await RolePermission.bulkCreate(rolePermissions, { transaction: t })
      }

      await t.commit()
      return role
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

  // -----------------------------------------
  // UPDATE ROLE (WITH PERMISSIONS)
  // -----------------------------------------
  async updateRole(id, data) {
    const { name, description, permissionIds, isActive } = data

    console.log('🔄 [RoleService] Update request:', { id, name, description, permissionIds, isActive })

    const role = await Role.findByPk(id)
    if (!role) throw new Error('Role not found')

    if (name && name !== role.name) {
      const existing = await Role.findOne({ where: { name } })
      if (existing) throw new Error('Role with this name already exists')
    }

    // Use transaction
    const t = await sequelize.transaction()

    try {
      // Update role basic info
      await role.update(
        {
          name: name ?? role.name,
          description: description ?? role.description,
          isActive: isActive ?? role.isActive
        },
        { transaction: t }
      )

      console.log('✅ [RoleService] Role basic info updated')

      // Update permissions if provided
      if (Array.isArray(permissionIds)) {
        console.log('🔐 [RoleService] Updating permissions...')

        // Remove old permissions
        const deletedCount = await RolePermission.destroy({
          where: { roleId: id },
          transaction: t
        })

        console.log(`🗑️ [RoleService] Deleted ${deletedCount} old permissions`)

        // Add new permissions
        if (permissionIds.length > 0) {
          // ✅ Remove duplicates and ensure numbers
          const uniquePermissionIds = [...new Set(permissionIds.map(id => Number(id)))]
          
          console.log('🔍 [RoleService] Unique permission IDs:', uniquePermissionIds)

          const rolePermissions = uniquePermissionIds.map(permissionId => ({
            roleId: Number(id),
            permissionId: permissionId
          }))

          console.log('📝 [RoleService] Inserting new permissions:', rolePermissions)

          // ✅ Use ignoreDuplicates to prevent constraint errors
          await RolePermission.bulkCreate(rolePermissions, { 
            transaction: t,
            ignoreDuplicates: true 
          })

          console.log(`✅ [RoleService] Inserted ${uniquePermissionIds.length} new permissions`)
        } else {
          console.log('⚠️ [RoleService] No permissions to insert')
        }
      } else {
        console.log('⏭️ [RoleService] Skipping permission update (not provided)')
      }

      await t.commit()
      console.log('✅ [RoleService] Transaction committed successfully')

      // Verify the update
      const updatedRole = await this.getRoleById(id)
      console.log('🔍 [RoleService] Updated role with permissions:', updatedRole)

      return updatedRole
    } catch (error) {
      await t.rollback()
      console.error('❌ [RoleService] Transaction rolled back:', error)
      throw error
    }
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

    // Use transaction
    const t = await sequelize.transaction()

    try {
      // Clean RBAC relations
      await RolePermission.destroy({ where: { roleId: id }, transaction: t })

      await role.destroy({ transaction: t })

      await t.commit()
      return true
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

 async getPermissions() {
    return Permission.findAll({
      attributes: ['id', 'key', 'name', 'createdAt'],
      order: [['key', 'ASC']]
    })
  }
}

export default new RoleService()