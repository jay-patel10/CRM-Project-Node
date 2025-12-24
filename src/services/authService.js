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
      { expiresIn: '1m' }
    );
  }

  // ===========================
  // GENERATE REFRESH TOKEN
  // ===========================
  async generateRefreshToken(userId) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.destroy({ where: { userId } });

  // Hash BEFORE saving (remove model hook or ensure it's not double-hashing)
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  await RefreshToken.create({
    userId,
    token: hashedToken, // ✅ Store hashed
    expiresAt
  });

  return rawToken; // ✅ Return raw token to client
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

 async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User does not exist');

    // 1️⃣ Generate ONE-TIME reset ID
    const resetTokenId = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Generated resetTokenId:', resetTokenId.substring(0, 10) + '...');

    // 2️⃣ Create JWT (short lived)
    const resetToken = jwt.sign(
      { id: user.id, tokenId: resetTokenId },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '15m' }
    );

    // 3️⃣ Hash resetTokenId ONLY (not JWT)
    const hashedResetTokenId = crypto
      .createHash('sha256')
      .update(resetTokenId)
      .digest('hex');
    console.log('🔒 Hashed resetTokenId:', hashedResetTokenId.substring(0, 10) + '...');

    // 4️⃣ Save on user (plain, not hashed)
    user.resetTokenId = resetTokenId;
    user.resetTokenCreatedAt = new Date();
    await user.save();
    console.log('✅ Saved plain resetTokenId to user table');

    // 5️⃣ Store hashed resetTokenId in RefreshToken (with isPasswordReset flag)
    await RefreshToken.create({
      userId: user.id,
      token: hashedResetTokenId, // Already hashed - model hook will skip
      isPasswordReset: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    console.log('✅ Saved hashed resetTokenId to refresh_tokens table');

    // 6️⃣ Send email
    const resetLink = `${process.env.FRONTEND_URL}/en/reset-password?token=${resetToken}`;

    await EmailService.sendTemplateEmail({
      to: user.email,
      templateSlug: 'password-reset',
      variables: {
        name: user.name || 'User',
        resetLink
      }
    });

    return { message: 'Password reset link sent to email' };
  }

  // ===========================
  // RESET PASSWORD
  // ===========================
    async resetPassword({ token, newPassword }) {
    try {
      // 1️⃣ Verify reset JWT
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET)
      console.log('✅ JWT verified for user:', decoded.id)

      // 2️⃣ Hash tokenId from JWT
      const hashedResetTokenId = crypto
        .createHash('sha256')
        .update(decoded.tokenId)
        .digest('hex')

      // 3️⃣ Validate one-time token from DB
      const tokenRecord = await RefreshToken.findOne({
        where: {
          userId: decoded.id,
          token: hashedResetTokenId,
          isPasswordReset: true
        }
      })

      if (!tokenRecord) {
        throw new Error('Reset link already used or invalid')
      }

      // 4️⃣ Expiry check
      if (tokenRecord.expiresAt < new Date()) {
        await RefreshToken.destroy({ where: { id: tokenRecord.id } })
        throw new Error('Reset link has expired')
      }

      // 5️⃣ Fetch user
      const user = await User.findByPk(decoded.id)
      if (!user) {
        throw new Error('User not found')
      }

      // 6️⃣ Update password
      user.password = await bcrypt.hash(newPassword, 10)
      user.passwordResetAt = new Date()
      await user.save()

      // 7️⃣ Invalidate token (ONE-TIME use)
      await RefreshToken.destroy({
        where: { id: tokenRecord.id }
      })

      return { message: 'Password updated successfully' }

    } catch (err) {
      console.error('❌ RESET PASSWORD ERROR:', err.message)

      if (err.name === 'TokenExpiredError') {
        throw new Error('Reset link has expired')
      }

      if (err.name === 'JsonWebTokenError') {
        throw new Error('Invalid reset token')
      }

      throw new Error(err.message)
    }
  }

  // ===========================
  // CLEANUP EXPIRED RESET TOKENS (Optional Cron Job)
  // ===========================
  async cleanupExpiredResetTokens() {
    const now = new Date();
    
    // Delete expired reset tokens from RefreshToken table
    const deleted = await RefreshToken.destroy({
      where: {
        isPasswordReset: true,
        expiresAt: { [Op.lt]: now }
      }
    });

    console.log(`🧹 Cleaned up ${deleted} expired reset tokens`);
    return deleted;
  }
}

export default new AuthService();