import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  gateway: {
    type: DataTypes.ENUM('stripe', 'greenpay'),
    allowNull: false
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

export default Payment;
