import { UserRole } from "@prisma/client"

export const PERMISSIONS = {
  // Dashboard
  "read:dashboard": "View dashboard",
  "write:dashboard": "Modify dashboard",

  // Bot Management
  "read:bot": "View bot status",
  "write:bot": "Control bot operations",
  "admin:bot": "Advanced bot configuration",

  // Tickets
  "read:tickets": "View tickets",
  "write:tickets": "Create and modify tickets",
  "assign:tickets": "Assign tickets to users",
  "delete:tickets": "Delete tickets",

  // Customers
  "read:customers": "View customers",
  "write:customers": "Create and modify customers",
  "delete:customers": "Delete customers",

  // Messages
  "read:messages": "View messages",
  "write:messages": "Send messages",

  // Analytics
  "read:analytics": "View analytics",
  "export:analytics": "Export analytics data",

  // Email
  "read:email": "View email templates and campaigns",
  "write:email": "Create and modify email templates",
  "send:email": "Send email campaigns",

  // Users
  "read:users": "View users",
  "write:users": "Create and modify users",
  "delete:users": "Delete users",

  // Settings
  "read:settings": "View settings",
  "write:settings": "Modify settings",

  // Logs
  "read:logs": "View logs",
  "export:logs": "Export logs",

  // Security
  "read:security": "View security events",
  "write:security": "Modify security settings",

  // API
  "read:api": "View API keys",
  "write:api": "Create and modify API keys",
} as const

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: Object.keys(PERMISSIONS),
  [UserRole.ADMIN]: [
    "read:dashboard",
    "write:dashboard",
    "read:bot",
    "write:bot",
    "read:tickets",
    "write:tickets",
    "assign:tickets",
    "read:customers",
    "write:customers",
    "read:messages",
    "write:messages",
    "read:analytics",
    "export:analytics",
    "read:email",
    "write:email",
    "send:email",
    "read:users",
    "write:users",
    "read:settings",
    "write:settings",
    "read:logs",
    "export:logs",
    "read:security",
    "read:api",
    "write:api",
  ],
  [UserRole.MANAGER]: [
    "read:dashboard",
    "read:bot",
    "read:tickets",
    "write:tickets",
    "assign:tickets",
    "read:customers",
    "write:customers",
    "read:messages",
    "write:messages",
    "read:analytics",
    "read:email",
    "write:email",
    "read:users",
    "read:logs",
  ],
  [UserRole.AGENT]: [
    "read:dashboard",
    "read:bot",
    "read:tickets",
    "write:tickets",
    "read:customers",
    "write:customers",
    "read:messages",
    "write:messages",
    "read:email",
  ],
  [UserRole.VIEWER]: [
    "read:dashboard",
    "read:bot",
    "read:tickets",
    "read:customers",
    "read:messages",
    "read:analytics",
  ],
}

export function hasPermission(userRole: UserRole, userPermissions: string[], permission: string): boolean {
  // Check if user has explicit permission
  if (userPermissions.includes(permission)) {
    return true
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

export function hasAnyPermission(userRole: UserRole, userPermissions: string[], permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, userPermissions, permission))
}

export function hasAllPermissions(userRole: UserRole, userPermissions: string[], permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, userPermissions, permission))
}
