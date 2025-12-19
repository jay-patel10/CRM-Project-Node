import UserService from '../services/userService.js';

class UserController {
  // GET /users
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ success: true, users });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /users/:id
  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  // POST /users
  async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body, req.user); // ✅ pass currentUser
      return res.status(201).json({ success: true, user });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /users/:id
  async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // DELETE /users/:id
  async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      return res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /users/bulk-delete
  async bulkDeleteUsers(req, res) {
    try {
      const { ids } = req.body;
      await UserService.bulkDeleteUsers(ids);
      return res.json({ success: true, message: 'Users deleted successfully' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export default new UserController();
