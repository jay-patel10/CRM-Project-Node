// seeders/2025xxxx-initial-rbac-seed.js
import bcrypt from 'bcryptjs'

export const up = async (queryInterface, Sequelize) => {
  const now = new Date()

  // -----------------------------------------
  // 1️⃣ INSERT ROLES
  // -----------------------------------------
  await queryInterface.bulkInsert('roles', [
    { id: 1, name: 'Admin', description: 'Full system access', isActive: true, createdAt: now, updatedAt: now },
    { id: 2, name: 'Manager', description: 'Manage leads and team members', isActive: true, createdAt: now, updatedAt: now },
    { id: 3, name: 'User', description: 'Basic CRM user', isActive: true, createdAt: now, updatedAt: now }
  ])

  // -----------------------------------------
  // 2️⃣ INSERT PERMISSIONS
  // -----------------------------------------
  const permissions = [
    { id: 1, key: 'users.create', name: 'Create Users' },
    { id: 2, key: 'users.read', name: 'Read Users' },
    { id: 3, key: 'users.update', name: 'Update Users' },
    { id: 4, key: 'users.delete', name: 'Delete Users' },
    { id: 5, key: 'roles.create', name: 'Create Roles' },
    { id: 6, key: 'roles.read', name: 'Read Roles' },
    { id: 7, key: 'roles.update', name: 'Update Roles' },
    { id: 8, key: 'roles.delete', name: 'Delete Roles' },
    { id: 9, key: 'leads.create', name: 'Create Leads' },
    { id: 10, key: 'leads.read', name: 'Read Leads' },
    { id: 11, key: 'leads.update', name: 'Update Leads' },
    { id: 12, key: 'leads.delete', name: 'Delete Leads' },
    { id: 13, key: 'settings.read', name: 'Read Settings' },
    { id: 14, key: 'settings.update', name: 'Update Settings' }
  ]

  await queryInterface.bulkInsert(
    'permissions',
    permissions.map(p => ({ ...p, createdAt: now, updatedAt: now }))
  )

  // -----------------------------------------
  // 3️⃣ ROLE ↔ PERMISSIONS
  // -----------------------------------------
  const rolePermissions = []

  permissions.forEach(p => {
    rolePermissions.push({ roleId: 1, permissionId: p.id, createdAt: now, updatedAt: now })
  })

  ;[2, 3, 6, 9, 10, 11, 13].forEach(pid => {
    rolePermissions.push({ roleId: 2, permissionId: pid, createdAt: now, updatedAt: now })
  })

  ;[9, 10, 2].forEach(pid => {
    rolePermissions.push({ roleId: 3, permissionId: pid, createdAt: now, updatedAt: now })
  })

  await queryInterface.bulkInsert('role_permissions', rolePermissions)

  // -----------------------------------------
  // 4️⃣ INSERT ADMIN USER (HASH HERE!)
  // -----------------------------------------
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await queryInterface.bulkInsert('users', [
    {
      id: 1,
      email: 'admin@crm.com',
      name: 'Admin User',
      password: hashedPassword, // ✅ HASHED ONCE
      roleId: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ])
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('users', null, {})
  await queryInterface.bulkDelete('role_permissions', null, {})
  await queryInterface.bulkDelete('permissions', null, {})
  await queryInterface.bulkDelete('roles', null, {})
}
