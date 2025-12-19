import { DataTypes } from 'sequelize'
import sequelize from '../config/sequelize.js'

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  },
  {
    tableName: 'permissions',
    timestamps: true
  }
)

export default Permission
