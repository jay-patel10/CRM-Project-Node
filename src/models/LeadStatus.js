import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const LeadStatus = sequelize.define('LeadStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#3B82F6'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lead_statuses',
  timestamps: true
});

export default LeadStatus;
