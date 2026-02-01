// Permission checking utilities for RISKA HD

import { getRoleByName, ROLE_NAMES } from "./roles";
import type { Permission } from "./constants";

interface UserWithRole {
  role?: string | null;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: UserWithRole | null | undefined,
  permission: Permission | string
): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Admin has all permissions
  if (user.role === ROLE_NAMES.ADMIN) {
    return true;
  }

  const roleDefinition = getRoleByName(user.role);
  if (!roleDefinition) {
    return false;
  }

  return roleDefinition.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserWithRole | null | undefined,
  permissions: (Permission | string)[]
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserWithRole | null | undefined,
  permissions: (Permission | string)[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if user has a specific role
 */
export function hasRole(
  user: UserWithRole | null | undefined,
  role: string
): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: UserWithRole | null | undefined,
  roles: string[]
): boolean {
  if (!user || !user.role) {
    return false;
  }
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, ROLE_NAMES.ADMIN);
}

/**
 * Get all permissions for a user based on their role
 */
export function getUserPermissions(
  user: UserWithRole | null | undefined
): string[] {
  if (!user || !user.role) {
    return [];
  }

  const roleDefinition = getRoleByName(user.role);
  if (!roleDefinition) {
    return [];
  }

  return roleDefinition.permissions;
}
