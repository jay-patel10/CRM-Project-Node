import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ApiKey = sequelize.define(
  'ApiKey',
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

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['leads:create']
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'api_keys',
    timestamps: true
  }
);

export default ApiKey;
