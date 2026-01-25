/**
 * TypeScript type definitions for Discount Types
 * Used by Settings domain for discount type management
 */

export interface DiscountType {
  id: number;
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateDiscountTypeRequest {
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
}

export interface UpdateDiscountTypeRequest {
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
}
