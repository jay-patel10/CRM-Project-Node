import User from '../models/User.js';
import Role from '../models/Role.js';

class UserService {
  // ---------------------------------------------------------
  // GET ALL USERS
  // ---------------------------------------------------------
  async getAllUsers() {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      roleId: u.roleId,
      roleName: u.role?.name,
      isActive: u.isActive,
      lastLogin: u.lastLogin
    }));
  }

  // ---------------------------------------------------------
  // GET USER BY ID
  // ---------------------------------------------------------
  async getUserById(id) {
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      roleName: user.role?.name,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };
  }

  // ---------------------------------------------------------
  // CREATE USER (Admin or Manager)
  // ---------------------------------------------------------
  async createUser(data, currentUser) {
    const { name, email, password, phone, roleId, isActive } = data;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error('Email already exists');

    let finalRoleId = roleId;

    // SAFETY: If somehow no currentUser, default to passed roleId
    if (currentUser && currentUser.roleId === 2) {
      // Manager cannot create Admin or Manager → force User role
      const userRole = await Role.findOne({ where: { name: 'User' } });
      finalRoleId = userRole.id;
    }

    const newUser = await User.create({
      name,
      email,
      password, // will be hashed by User model hook
      phone,
      roleId: finalRoleId,
      isActive: isActive ?? true
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      roleId: newUser.roleId,
      isActive: newUser.isActive
    };
  }

  // ---------------------------------------------------------
  // UPDATE USER
  // ---------------------------------------------------------
  async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    const allowedFields = ['name', 'email', 'phone', 'avatar', 'roleId', 'isActive', 'password'];

    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) {
        user[key] = data[key];
      }
    }

    await user.save();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      isActive: user.isActive
    };
  }

  // ---------------------------------------------------------
  // DELETE USER
  // ---------------------------------------------------------
  async deleteUser(id) {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) throw new Error('User not found');
    return true;
  }

  // ---------------------------------------------------------
  // BULK DELETE USERS
  // ---------------------------------------------------------
  async bulkDeleteUsers(ids) {
    await User.destroy({
      where: {
        id: ids
      }
    });

    return true;
  }
}

export default new UserService();
