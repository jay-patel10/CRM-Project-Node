import sequelize from '../config/sequelize.js'

// Models
import User from './User.js'
import Role from './Role.js'
import Permission from './Permission.js'
import RolePermission from './RolePermission.js'

import Lead from './Lead.js'
import LeadStatus from './LeadStatus.js'
import ActivityLog from './ActivityLog.js'
import EmailTemplate from './EmailTemplate.js'
import ApiKey from './ApiKey.js'
import Subscription from './Subscription.js'
import SubscriptionPlan from './SubscriptionPlan.js'
import Payment from './Payment.js'
import RefreshToken from './RefreshToken.js'

// =============================
//        RELATIONSHIPS
// =============================

// -----------------------------
// User <-> Role
// -----------------------------
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' })
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' })

// -----------------------------
// Role <-> Permission (RBAC)
// -----------------------------
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
})

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
})

// -----------------------------
// Lead <-> User  (Assigned To)
// -----------------------------
Lead.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedUser' })
User.hasMany(Lead, { foreignKey: 'assignedToId', as: 'assignedLeads' })

// -----------------------------
// Lead <-> LeadStatus
// -----------------------------
Lead.belongsTo(LeadStatus, { foreignKey: 'statusId', as: 'status' })
LeadStatus.hasMany(Lead, { foreignKey: 'statusId', as: 'leads' })

// -----------------------------
// ActivityLog <-> User
// -----------------------------
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' })

// -----------------------------
// Subscription <-> User
// -----------------------------
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' })

// -----------------------------
// Subscription <-> SubscriptionPlan
// -----------------------------
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' })
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' })

// -----------------------------
// Payment <-> User
// -----------------------------
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' })

// -----------------------------
// Payment <-> Subscription
// -----------------------------
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' })
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' })

// -----------------------------
// RefreshToken <-> User
// -----------------------------
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' })

export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Lead,
  LeadStatus,
  ActivityLog,
  EmailTemplate,
  ApiKey,
  Subscription,
  SubscriptionPlan,
  Payment,
  RefreshToken
}
