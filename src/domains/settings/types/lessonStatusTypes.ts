/**
 * TypeScript type definitions for Lesson Statuses
 * Used by Settings domain for lesson status management (description editing only)
 */

import { LessonStatusName } from '@/types/api/lesson';

export interface LessonStatus {
  id: string;
  name: LessonStatusName;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLessonStatusRequest {
  description: string | null;
}
