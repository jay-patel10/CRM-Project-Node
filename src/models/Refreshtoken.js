import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import crypto from 'crypto';

const RefreshToken = sequelize.define('RefreshToken', {
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
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  hooks: {
    // ✅ Hash refresh token before saving
    beforeCreate: async (refreshToken) => {
      if (refreshToken.token) {
        const rawToken = refreshToken.token;
        refreshToken.token = crypto
          .createHash('sha256')
          .update(rawToken)
          .digest('hex');
        
        console.log('🔒 Token hashed in beforeCreate hook');
      }
    },
    beforeUpdate: async (refreshToken) => {
      if (refreshToken.changed('token')) {
        const rawToken = refreshToken.token;
        refreshToken.token = crypto
          .createHash('sha256')
          .update(rawToken)
          .digest('hex');
        
        console.log('🔒 Token hashed in beforeUpdate hook');
      }
    }
  }
});

export default RefreshToken;