import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  statusId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  utmSource: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmMedium: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmCampaign: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  apiSource: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'leads',
  timestamps: true
});

export default Lead;
