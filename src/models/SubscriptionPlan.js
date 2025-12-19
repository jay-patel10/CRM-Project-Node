import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'yearly', 'lifetime'),
    defaultValue: 'monthly'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true
});

export default SubscriptionPlan;
