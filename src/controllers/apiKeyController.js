import ApiKeyService from '../services/apiKeyService.js';

// ============================
// GET ALL API KEYS
// ============================
export const getApiKeys = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const result = await ApiKeyService.getAllApiKeys({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    });

    res.json({
      success: true,
      data: result.apiKeys,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get API Keys Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch API keys'
    });
  }
};

// ============================
// GET API KEY BY ID
// ============================
export const getApiKeyById = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKeyService.getApiKeyById(id, req.user.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found'
      });
    }

    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Get API Key Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch API key'
    });
  }
};

// ============================
// CREATE API KEY
// ============================
export const createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;

    // Validation
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Name and permissions array are required'
      });
    }

    const apiKey = await ApiKeyService.createApiKey({
      userId: req.user.id,
      name,
      permissions,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'API Key created successfully',
      data: apiKey
    });
  } catch (error) {
    console.error('Create API Key Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create API key'
    });
  }
};

// ============================
// UPDATE API KEY
// ============================
export const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, expiresAt } = req.body;

    const apiKey = await ApiKeyService.updateApiKey(id, req.user.id, {
      name,
      permissions,
      expiresAt
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found'
      });
    }

    res.json({
      success: true,
      message: 'API Key updated successfully',
      data: apiKey
    });
  } catch (error) {
    console.error('Update API Key Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update API key'
    });
  }
};

// ============================
// TOGGLE API KEY STATUS
// ============================
export const toggleApiKeyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKeyService.toggleApiKeyStatus(id, req.user.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found'
      });
    }

    res.json({
      success: true,
      message: `API Key ${apiKey.isActive ? 'activated' : 'deactivated'} successfully`,
      data: apiKey
    });
  } catch (error) {
    console.error('Toggle API Key Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle API key status'
    });
  }
};

// ============================
// REGENERATE API KEY
// ============================
export const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKeyService.regenerateApiKey(id, req.user.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found'
      });
    }

    res.json({
      success: true,
      message: 'API Key regenerated successfully',
      data: apiKey
    });
  } catch (error) {
    console.error('Regenerate API Key Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate API key'
    });
  }
};

// ============================
// DELETE API KEY
// ============================
export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ApiKeyService.deleteApiKey(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found'
      });
    }

    res.json({
      success: true,
      message: 'API Key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API Key Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete API key'
    });
  }
};