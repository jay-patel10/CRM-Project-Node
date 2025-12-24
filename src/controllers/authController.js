import AuthService from '../services/authService.js';

// ===========================
// LOGIN
// ===========================
export const login = async (req, res) => {
  try {
    console.log('📥 LOGIN REQUEST:', req.body.email);
    
    const data = await AuthService.login(req.body);
    
    console.log('✅ LOGIN SUCCESS:', {
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      permissionsCount: data.user.permissions?.length || 0
    });

    return res.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user
    });
  } catch (err) {
    console.error('❌ LOGIN ERROR:', err.message);
    
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
};

// ===========================
// REGISTER (Admin/Manager)
// ===========================
export const register = async (req, res) => {
  try {
    console.log('📥 REGISTER REQUEST:', req.body.email);
    
    const data = await AuthService.register(req.body, req.user);
    
    console.log('✅ REGISTER SUCCESS:', data.user.email);

    return res.status(201).json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user
    });
  } catch (err) {
    console.error('❌ REGISTER ERROR:', err.message);
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ===========================
// REFRESH TOKEN
// ===========================
// controllers/authController.js
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' })
    }

    const result = await AuthService.refresh(refreshToken)

    // ✅ Ensure we return the same structure as login
    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    })
  } catch (error) {
    console.error('REFRESH ERROR:', error.message)
    return res.status(401).json({ message: error.message })
  }
}
// ===========================
// LOGOUT
// ===========================
export const logout = async (req, res) => {
  try {
    console.log('👋 LOGOUT REQUEST:', req.user.id);
    
    const result = await AuthService.logout(req.user.id);
    
    console.log('✅ LOGOUT SUCCESS');

    return res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error('❌ LOGOUT ERROR:', err.message);
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ===========================
// FORGOT PASSWORD
// ===========================
export const forgotPassword = async (req, res) => {
  try {
    console.log('🔑 FORGOT PASSWORD REQUEST:', req.body.email);
    
    const result = await AuthService.forgotPassword(req.body.email);
    
    console.log('✅ RESET LINK GENERATED');

    return res.json({
      success: true,
      message: result.message,
      // Remove resetLink in production
      resetLink: result.resetLink
    });
  } catch (err) {
    console.error('❌ FORGOT PASSWORD ERROR:', err.message);
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ===========================
// RESET PASSWORD
// ===========================
export const resetPassword = async (req, res) => {
  try {
    console.log('🔐 RESET PASSWORD REQUEST');
    
    const result = await AuthService.resetPassword(req.body);
    
    console.log('✅ PASSWORD RESET SUCCESS');

    return res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error('❌ RESET PASSWORD ERROR:', err.message);
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

