"use client";

import { useSession } from "@/lib/auth-client";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
} from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Single permission required */
  permission?: Permission | string;
  /** Multiple permissions - user needs at least one */
  anyPermission?: (Permission | string)[];
  /** Multiple permissions - user needs all */
  allPermissions?: (Permission | string)[];
  /** Single role required */
  role?: string;
  /** Multiple roles - user needs at least one */
  anyRole?: string[];
  /** Fallback content when user doesn't have permission */
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  fallback = null,
}: PermissionGuardProps) {
  const { data: session } = useSession();
  const user = session?.user as { role?: string | null } | undefined;

  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(user, permission);
  }

  if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAccess && hasAnyPermission(user, anyPermission);
  }

  if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAccess && hasAllPermissions(user, allPermissions);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(user, role);
  }

  if (anyRole && anyRole.length > 0) {
    hasAccess = hasAccess && hasAnyRole(user, anyRole);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  role?: string;
  anyRole?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  role,
  anyRole,
  fallback = null,
}: RoleGuardProps) {
  const { data: session } = useSession();
  const user = session?.user as { role?: string | null } | undefined;

  let hasAccess = true;

  if (role) {
    hasAccess = hasRole(user, role);
  }

  if (anyRole && anyRole.length > 0) {
    hasAccess = hasAnyRole(user, anyRole);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
