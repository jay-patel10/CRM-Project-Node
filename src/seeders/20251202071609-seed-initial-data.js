import bcrypt from 'bcryptjs'

export const up = async (queryInterface) => {
  const now = new Date()

  // =====================================================
  // 1️⃣ LEAD STATUSES (PARENT TABLE – MUST COME FIRST)
  // =====================================================
  await queryInterface.bulkInsert('lead_statuses', [
    {
      id: 1,
      name: 'New',
      color: '#3B82F6',
      order: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      name: 'Contacted',
      color: '#F59E0B',
      order: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      name: 'Qualified',
      color: '#10B981',
      order: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      name: 'Lost',
      color: '#EF4444',
      order: 4,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ])

  // =====================================================
  // 2️⃣ ROLES
  // =====================================================
  await queryInterface.bulkInsert('roles', [
    { id: 1, name: 'Admin', description: 'Full system access', isActive: true, createdAt: now, updatedAt: now },
    { id: 2, name: 'Manager', description: 'Manage leads and team', isActive: true, createdAt: now, updatedAt: now },
    { id: 3, name: 'User', description: 'Basic CRM user', isActive: true, createdAt: now, updatedAt: now }
  ])

  // =====================================================
  // 3️⃣ PERMISSIONS
  // =====================================================
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
    { id: 14, key: 'settings.update', name: 'Update Settings' },
    { id: 15, key: 'api_keys.read', name: 'Read API Keys' },
    { id: 16, key: 'api_keys.create', name: 'Create API Keys' },
    { id: 17, key: 'api_keys.update', name: 'Update API Keys' },
    { id: 18, key: 'api_keys.delete', name: 'Delete API Keys' }
  ]

  await queryInterface.bulkInsert(
    'permissions',
    permissions.map(p => ({ ...p, createdAt: now, updatedAt: now }))
  )

 // =====================================================
// 4️⃣ ROLE ↔ PERMISSIONS (ADMIN = ALL)
// =====================================================

// Fetch all permissions from DB
const allPermissions = await queryInterface.sequelize.query(
  'SELECT id FROM permissions',
  { type: queryInterface.sequelize.QueryTypes.SELECT }
)

const rolePermissions = []

// Admin → ALL permissions (dynamic)
allPermissions.forEach(p => {
  rolePermissions.push({
    roleId: 1, // Admin
    permissionId: p.id,
    createdAt: now,
    updatedAt: now
  })
})

// Manager → limited permissions
;[2, 5, 6, 7].forEach(pid => {
  rolePermissions.push({
    roleId: 2,
    permissionId: pid,
    createdAt: now,
    updatedAt: now
  })
})

// User → basic lead access
;[5, 6].forEach(pid => {
  rolePermissions.push({
    roleId: 3,
    permissionId: pid,
    createdAt: now,
    updatedAt: now
  })
})

await queryInterface.bulkInsert('role_permissions', rolePermissions)

  // =====================================================
  // 5️⃣ USERS
  // =====================================================
  const adminPass = await bcrypt.hash('admin123', 10)
  const managerPass = await bcrypt.hash('manager123', 10)
  const userPass = await bcrypt.hash('user123', 10)

  await queryInterface.bulkInsert('users', [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@crm.com',
      password: adminPass,
      roleId: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      name: 'Manager User',
      email: 'manager@crm.com',
      password: managerPass,
      roleId: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      name: 'Sales User 1',
      email: 'user1@crm.com',
      password: userPass,
      roleId: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      name: 'Sales User 2',
      email: 'user2@crm.com',
      password: userPass,
      roleId: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ])

  // =====================================================
  // 6️⃣ LEADS (FK SAFE + JSON STRINGIFIED)
  // =====================================================
  await queryInterface.bulkInsert('leads', [
    {
      name: 'Ravi Kumar',
      email: 'ravi@gmail.com',
      phone: '8888881111',
      company: 'TCS',
      statusId: 1,
      source: 'Website',
      assignedToId: 3,
      notes: 'Interested in CRM demo',
      customFields: JSON.stringify({ budget: '50k' }),
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'crm-demo',
      apiSource: 'web',
      createdAt: now,
      updatedAt: now
    },
    {
      name: 'Anita Sharma',
      email: 'anita@gmail.com',
      phone: '8888882222',
      company: 'Infosys',
      statusId: 2,
      source: 'Facebook',
      assignedToId: 4,
      notes: 'Follow up next week',
      customFields: JSON.stringify({ priority: 'high' }),
      apiSource: 'meta',
      createdAt: now,
      updatedAt: now
    },
    {
      name: 'John Doe',
      email: 'john@gmail.com',
      phone: '8888883333',
      company: 'Startup Inc',
      statusId: 3,
      source: 'Referral',
      assignedToId: 2,
      notes: 'Warm lead',
      customFields: JSON.stringify({}),
      apiSource: 'manual',
      createdAt: now,
      updatedAt: now
    }
  ])
}

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('leads', null, {})
  await queryInterface.bulkDelete('users', null, {})
  await queryInterface.bulkDelete('role_permissions', null, {})
  await queryInterface.bulkDelete('permissions', null, {})
  await queryInterface.bulkDelete('roles', null, {})
  await queryInterface.bulkDelete('lead_statuses', null, {})
}
