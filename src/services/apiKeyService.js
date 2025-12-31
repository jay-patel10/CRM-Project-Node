import { Op } from 'sequelize';
import ApiKey from '../models/ApiKey.js';
import crypto from 'crypto';

class ApiKeyService {
  // Generate secure API key
  static generateKey() {
    return `crm_${crypto.randomBytes(32).toString('hex')}`;
  }

  // ============================
  // GET ALL API KEYS
  // ============================
  static async getAllApiKeys({ userId, page = 1, limit = 10, search, isActive }) {
    const offset = (page - 1) * limit;

    const where = { userId }; // Keep userId filter

    // Search filter
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // Status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await ApiKey.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['key'] } // Don't expose full key in list
    });

    return {
      apiKeys: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // ============================
  // GET API KEY BY ID
  // ============================
  static async getApiKeyById(id, userId) {
    return await ApiKey.findOne({
      where: { id, userId }
    });
  }

  // ============================
  // CREATE API KEY
  // ============================
  static async createApiKey({ userId, name, permissions, expiresAt }) {
    const key = this.generateKey();

    const apiKey = await ApiKey.create({
      userId,
      name,
      key,
      permissions,
      expiresAt,
      isActive: true
    });

    return apiKey;
  }

  // ============================
  // UPDATE API KEY
  // ============================
  static async updateApiKey(id, userId, { name, permissions, expiresAt }) {
    const apiKey = await ApiKey.findOne({ where: { id, userId } });

    if (!apiKey) {
      return null;
    }

    if (name) apiKey.name = name;
    if (permissions) apiKey.permissions = permissions;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt;

    await apiKey.save();
    return apiKey;
  }

  // ============================
  // TOGGLE API KEY STATUS
  // ============================
  static async toggleApiKeyStatus(id, userId) {
    const apiKey = await ApiKey.findOne({ where: { id, userId } });

    if (!apiKey) {
      return null;
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    return apiKey;
  }

  // ============================
  // REGENERATE API KEY
  // ============================
  static async regenerateApiKey(id, userId) {
    const apiKey = await ApiKey.findOne({ where: { id, userId } });

    if (!apiKey) {
      return null;
    }

    apiKey.key = this.generateKey();
    await apiKey.save();

    return apiKey;
  }

  // ============================
  // DELETE API KEY
  // ============================
  static async deleteApiKey(id, userId) {
    const result = await ApiKey.destroy({
      where: { id, userId }
    });

    return result > 0;
  }

  // ============================
  // VERIFY API KEY (for API requests)
  // ============================
  static async verifyApiKey(key) {
    const apiKey = await ApiKey.findOne({
      where: {
        key,
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      }
    });

    if (apiKey) {
      // Update last used timestamp
      apiKey.lastUsedAt = new Date();
      await apiKey.save();
    }

    return apiKey;
  }
}

export default ApiKeyService;