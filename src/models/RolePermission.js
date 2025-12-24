import { DataTypes } from 'sequelize'
import sequelize from '../config/sequelize.js'

const RolePermission = sequelize.define(
  'RolePermission',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    tableName: 'role_permissions',
    timestamps: true,
    // ✅ Prevent duplicate role-permission combinations
    indexes: [
      {
        unique: true,
        fields: ['roleId', 'permissionId'],
        name: 'unique_role_permission'
      }
    ]
  }
)

export default RolePermission