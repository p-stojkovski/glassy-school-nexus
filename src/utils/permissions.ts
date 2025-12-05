/**
 * Permission utilities for role-based access control
 * 
 * This module provides helpers to check user permissions based on their role.
 * It centralizes permission logic to ensure consistent access control throughout the app.
 */

import { UserRole } from '@/types/enums';
import { User } from '@/services/authService';

/**
 * Permission flags that can be checked throughout the application
 */
export interface UserPermissions {
  /** Can view detailed finance information (balances, obligations, payment history) */
  canViewFinance: boolean;
  /** Can manage payments (create, edit payments and obligations) */
  canManagePayments: boolean;
  /** Can manage students (create, edit, delete students) */
  canManageStudents: boolean;
  /** Can manage classes (create, edit, delete classes) */
  canManageClasses: boolean;
  /** Can view all students (not just own) */
  canViewAllStudents: boolean;
  /** Can access administrative settings */
  canAccessSettings: boolean;
  /** Is an admin or owner role */
  isAdminOrOwner: boolean;
  /** Is a teacher role */
  isTeacher: boolean;
}

/**
 * Get all permissions for a user based on their role
 * @param user - The current user or null
 * @returns Permission flags object
 */
export function getUserPermissions(user: User | null): UserPermissions {
  if (!user) {
    return {
      canViewFinance: false,
      canManagePayments: false,
      canManageStudents: false,
      canManageClasses: false,
      canViewAllStudents: false,
      canAccessSettings: false,
      isAdminOrOwner: false,
      isTeacher: false,
    };
  }

  const role = user.role?.toLowerCase() as UserRole | undefined;
  
  // Admin role has full access
  const isAdmin = role === UserRole.Admin;
  
  // Teacher role has limited access
  const isTeacher = role === UserRole.Teacher;
  
  // Student role has minimal access
  const isStudent = role === UserRole.Student;

  return {
    // Finance: only admins can view detailed finance
    canViewFinance: isAdmin,
    
    // Payment management: only admins can manage payments
    canManagePayments: isAdmin,
    
    // Student management: admins and teachers can manage students
    canManageStudents: isAdmin || isTeacher,
    
    // Class management: admins and teachers can manage classes
    canManageClasses: isAdmin || isTeacher,
    
    // View all students: admins see all, teachers might see only their students
    canViewAllStudents: isAdmin || isTeacher,
    
    // Settings: only admins can access administrative settings
    canAccessSettings: isAdmin,
    
    // Role flags
    isAdminOrOwner: isAdmin,
    isTeacher: isTeacher,
  };
}

/**
 * Check if user can view finance details
 * @param user - The current user or null
 * @returns true if user can view finance
 */
export function canViewFinance(user: User | null): boolean {
  return getUserPermissions(user).canViewFinance;
}

/**
 * Check if user can manage payments
 * @param user - The current user or null
 * @returns true if user can manage payments
 */
export function canManagePayments(user: User | null): boolean {
  return getUserPermissions(user).canManagePayments;
}

/**
 * Check if user can manage students
 * @param user - The current user or null
 * @returns true if user can manage students
 */
export function canManageStudents(user: User | null): boolean {
  return getUserPermissions(user).canManageStudents;
}

/**
 * Check if user is admin or owner
 * @param user - The current user or null
 * @returns true if user is admin or owner
 */
export function isAdminOrOwner(user: User | null): boolean {
  return getUserPermissions(user).isAdminOrOwner;
}
