import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired', 'pending'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  greenpaySubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'subscriptions',
  timestamps: true
});

export default Subscription;
