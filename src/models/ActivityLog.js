import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  recordId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  updatedAt: false
});

export default ActivityLog;
