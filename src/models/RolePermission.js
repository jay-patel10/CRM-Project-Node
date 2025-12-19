import sequelize from '../config/sequelize.js'

const RolePermission = sequelize.define(
  'RolePermission',
  {},
  {
    tableName: 'role_permissions',
    timestamps: true
  }
)

export default RolePermission
