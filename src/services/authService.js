import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  User,
  Role,
  Permission,
  RefreshToken
} from '../models/index.js'
import EmailService from './EmailService.js'


class AuthService {

  // ===========================
  // GENERATE ACCESS TOKEN
  // ===========================
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role?.name || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  // ===========================
  // GENERATE REFRESH TOKEN
  // ===========================
  async generateRefreshToken(userId) {
    // Generate raw token
    const rawToken = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Delete old refresh tokens for this user
    await RefreshToken.destroy({ where: { userId } });

    // Create new refresh token (will be hashed by hook)
    await RefreshToken.create({
      userId,
      token: rawToken,
      expiresAt
    });

    return rawToken; // Return the raw token to send to client
  }

  // ===========================
  // LOGIN USER
  // ===========================
  async login({ email, password }) {
    console.log('🔐 LOGIN ATTEMPT:', email)

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    })

    console.log('👤 USER FOUND:', user ? 'YES' : 'NO')

    if (!user) {
      throw new Error('User not found')
    }

    console.log('🔑 Validating password...')

    const valid = await bcrypt.compare(password, user.password)

    console.log('🔓 PASSWORD VALID:', valid)

    if (!valid) {
      throw new Error('Invalid password')
    }

    // Extract permission keys
    const permissionKeys = user.role?.permissions?.map(p => p.key) || []

    console.log('✅ PERMISSION KEYS:', permissionKeys)

    // 🔥 Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    console.log('🎟️ TOKENS GENERATED')

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        role: user.role?.name || 'user',
        permissions: permissionKeys
      }
    }
  }

  // ===========================
  // REGISTER USER (ADMIN/MANAGER)
  // ===========================
  async register(data, currentUser) {
    const { email, name, password, roleId } = data;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error("Email already exists");

    let assignedRole = roleId;

    if (currentUser && currentUser.role.name === "Manager") {
      const userRole = await Role.findOne({ where: { name: 'User' } });
      assignedRole = userRole.id;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      roleId: assignedRole
    });

    // 🔥 Generate tokens for new user
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { 
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId
      }
    };
  }

  // ===========================
  // REFRESH TOKEN
  // ===========================
  async refresh(refreshTokenRaw) {
    if (!refreshTokenRaw) throw new Error("Refresh token missing");

    // Hash the incoming token to compare with stored hash
    const hashed = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

    const stored = await RefreshToken.findOne({ where: { token: hashed } });
    
    if (!stored) throw new Error("Invalid refresh token");
    if (stored.expiresAt < new Date()) {
      // Clean up expired token
      await RefreshToken.destroy({ where: { id: stored.id } });
      throw new Error("Refresh token expired");
    }

    // Get user with role and permissions
    const user = await User.findByPk(stored.userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) throw new Error("User not found");

    // Extract permission keys
    const permissionKeys = user.role?.permissions?.map(p => p.key) || []

    // Generate new access token
    const newAccessToken = this.generateAccessToken(user);

    // Optionally generate new refresh token (token rotation)
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        role: user.role?.name || 'user',
        permissions: permissionKeys
      }
    };
  }

  // ===========================
  // LOGOUT
  // ===========================
  async logout(userId) {
    await RefreshToken.destroy({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  // ===========================
  // FORGOT PASSWORD (STATELESS)
  // ===========================
  async forgotPassword(email) {
  const user = await User.findOne({ where: { email } })
  if (!user) throw new Error('User does not exist')

  const resetToken = jwt.sign(
    { id: user.id },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '15m' }
  )

const resetLink = `${process.env.FRONTEND_URL}/en/reset-password?token=${resetToken}`

  // ✅ SEND EMAIL
  await EmailService.sendTemplateEmail({
    to: user.email,
    templateSlug: 'password-reset',
    variables: {
      name: user.name || 'User',
      resetLink
    }
  })

  return { message: 'Password reset link sent to email' }
}


  // ===========================
  // RESET PASSWORD (STATELESS)
  // ===========================
  async resetPassword({ token, newPassword }) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET)

    const user = await User.findByPk(decoded.id)
    if (!user) throw new Error('User not found')

    // 🔐 CHECK IF TOKEN WAS USED BEFORE
    if (user.passwordResetAt) {
      throw new Error('Reset link already used')
    }

    // 🔐 HASH PASSWORD
    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed

    // 🔐 MARK TOKEN AS USED
    user.passwordResetAt = new Date()
    await user.save()

    // 🔐 LOGOUT EVERYWHERE
    await RefreshToken.destroy({ where: { userId: user.id } })

    return { message: 'Password updated successfully' }
  } catch (err) {
    throw new Error('Invalid or expired reset token')
  }
}

}

export default new AuthService();