/**
 * TypeScript type definitions for Subjects
 * Used by Settings domain for subject management
 */

export interface Subject {
  id: number;
  key: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateSubjectRequest {
  key: string;
  name: string;
  sortOrder: number;
}

export interface UpdateSubjectRequest {
  key: string;
  name: string;
  sortOrder: number;
}
