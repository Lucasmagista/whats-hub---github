"use client"

import { useSession } from "next-auth/react"
import type { UserRole } from "@prisma/client"
import { hasPermission, hasAnyPermission } from "@/lib/permissions"
import type { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  roles?: UserRole[]
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function RoleGuard({ children, roles, permissions, requireAll = false, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return <>{fallback}</>
  }

  const userRole = session.user.role as UserRole
  const userPermissions = (session.user.permissions as string[]) || []

  // Check roles
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>
  }

  // Check permissions
  if (permissions) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((permission) => hasPermission(userRole, userPermissions, permission))
      : hasAnyPermission(userRole, userPermissions, permissions)

    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
