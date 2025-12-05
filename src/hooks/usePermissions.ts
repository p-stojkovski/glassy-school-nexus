/**
 * Hook for accessing user permissions based on current authentication state
 */

import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/domains/auth/authSlice';
import { getUserPermissions, UserPermissions } from '@/utils/permissions';

/**
 * Hook that returns current user's permissions
 * @returns UserPermissions object with role-based permission flags
 */
export function usePermissions(): UserPermissions {
  const user = useAppSelector(selectUser);
  return getUserPermissions(user);
}

/**
 * Hook that returns whether current user can view finance information
 * @returns true if user can view finance
 */
export function useCanViewFinance(): boolean {
  const { canViewFinance } = usePermissions();
  return canViewFinance;
}

/**
 * Hook that returns whether current user can manage payments
 * @returns true if user can manage payments
 */
export function useCanManagePayments(): boolean {
  const { canManagePayments } = usePermissions();
  return canManagePayments;
}

/**
 * Hook that returns whether current user is admin or owner
 * @returns true if user is admin or owner
 */
export function useIsAdminOrOwner(): boolean {
  const { isAdminOrOwner } = usePermissions();
  return isAdminOrOwner;
}
