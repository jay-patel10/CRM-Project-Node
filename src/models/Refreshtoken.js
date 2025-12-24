import { DataTypes } from 'sequelize'
import sequelize from '../config/sequelize.js'

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    token: {
      type: DataTypes.STRING(500),
      allowNull: false
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },

    isPasswordReset: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    resetTokenId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true
  }
)

export default RefreshToken
