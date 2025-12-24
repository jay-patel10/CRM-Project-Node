import RoleService from '../services/roleService.js';

export const getRoles = async (req, res) => {
  try {
    const roles = await RoleService.getRoles();
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await RoleService.getRoleById(req.params.id);
    res.json({ success: true, role });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const role = await RoleService.createRole(req.body);
    res.status(201).json({ success: true, message: "Role created successfully", role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await RoleService.updateRole(req.params.id, req.body);
    res.json({ success: true, message: "Role updated successfully", role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    await RoleService.deleteRole(req.params.id);
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPermissions = async (req, res) => {
  try {
    const permissions = await RoleService.getPermissions()
    res.json({ success: true, permissions })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}