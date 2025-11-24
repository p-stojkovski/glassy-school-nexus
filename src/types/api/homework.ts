// Homework API contracts and helpers for ThinkEnglish UI (Phase 1 simplified model)

// Homework assignment response from API.
// Phase 1: description-only model plus metadata required by the teacher dashboard.
export interface HomeworkAssignmentResponse {
  id: string | null;           // GUID of the homework assignment (null if no homework)
  lessonId: string;            // GUID of the lesson
  description: string | null;  // Description of the assignment (null if no homework)
  assignedDate: string | null; // Date when assigned (ISO 8601 date, null if no homework)
  hasHomework: boolean;        // Indicates whether homework exists for this lesson
}

// Create Homework Assignment Request DTO (description-only)
export interface CreateHomeworkAssignmentRequest {
  description: string; // Required description text
}

// Update Homework Assignment Request DTO (description-only)
export interface UpdateHomeworkAssignmentRequest {
  description: string; // Required description text
}

// Previous Homework Response DTO (embedded assignment uses simplified shape)
export interface PreviousHomeworkResponse {
  hasHomework: boolean;                    // Whether previous lesson had homework
  assignment?: HomeworkAssignmentResponse; // Assignment details (if exists)
  previousLessonId?: string;               // Previous lesson ID (if found)
  previousLessonDate?: string;             // Previous lesson date (ISO 8601)
}

// Homework Completion Statistics DTO (unchanged)
export interface HomeworkCompletionStats {
  complete: number;   // Number of students who completed homework
  partial: number;    // Number of students with partial completion
  missing: number;    // Number of students who missed homework
  notChecked: number; // Number of students not yet checked
}

// Homework Completion Summary Response DTO (unchanged)
export interface HomeworkCompletionSummaryResponse {
  lessonId: string;                        // GUID of the lesson
  totalStudents: number;                   // Total number of enrolled students
  completionStats: HomeworkCompletionStats; // Breakdown by status
  completionRate: number;                  // Percentage of students who completed (complete + partial)
  fullCompletionRate: number;              // Percentage of students who fully completed
  hasHomeworkAssignment: boolean;          // Whether the lesson has a homework assignment
}

// Homework Assignment Form Data (for frontend hooks/components)
// Phase 1: only description is editable.
export interface HomeworkAssignmentFormData {
  description: string;
}

// Homework Management State (for potential future UI state aggregation)
export interface HomeworkManagementState {
  currentAssignment: HomeworkAssignmentResponse | null;
  previousHomework: PreviousHomeworkResponse | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  hasChanges: boolean;
}

// Homework Modal Mode (kept for compatibility with existing state, though not actively used)
export type HomeworkModalMode = 'check' | 'assign';

// API Path constants
export const HomeworkApiPaths = {
  GET_ASSIGNMENT: (lessonId: string) => `/api/lessons/${lessonId}/homework-assignment`,
  CREATE_ASSIGNMENT: (lessonId: string) => `/api/lessons/${lessonId}/homework-assignment`,
  UPDATE_ASSIGNMENT: (lessonId: string) => `/api/lessons/${lessonId}/homework-assignment`,
  DELETE_ASSIGNMENT: (lessonId: string) => `/api/lessons/${lessonId}/homework-assignment`,
  GET_PREVIOUS_HOMEWORK: (lessonId: string) => `/api/lessons/${lessonId}/previous-homework`,
  GET_HOMEWORK_COMPLETION_SUMMARY: (lessonId: string) => `/api/lessons/${lessonId}/homework-completion-summary`,
} as const;

// HTTP Status codes for homework operations
export const HomeworkHttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
