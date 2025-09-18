// Assignment types enum
export type HomeworkAssignmentType = 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'general';

// Homework Assignment Response DTO
export interface HomeworkAssignmentResponse {
  id: string;                           // GUID of the homework assignment
  lessonId: string;                     // GUID of the lesson
  title: string;                        // Title of the homework assignment
  description: string | null;           // Description of the assignment
  assignedDate: string;                 // Date when assigned (ISO 8601 date)
  dueDate: string | null;               // Due date (ISO 8601 date, nullable)
  assignmentType: HomeworkAssignmentType; // Type: reading, writing, vocabulary, grammar, general
  instructions: string | null;          // Additional instructions
  createdAt: string;                    // Creation timestamp (ISO 8601)
}

// Create Homework Assignment Request DTO
export interface CreateHomeworkAssignmentRequest {
  title: string;                        // Title of the assignment (required)
  description?: string;                 // Description (optional)
  dueDate?: string;                     // Due date in ISO 8601 format (optional)
  assignmentType?: HomeworkAssignmentType; // Type (defaults to 'general')
  instructions?: string;                // Instructions (optional)
}

// Update Homework Assignment Request DTO
export interface UpdateHomeworkAssignmentRequest {
  title: string;                        // Title of the assignment (required)
  description?: string;                 // Description (optional)
  dueDate?: string;                     // Due date in ISO 8601 format (optional)
  assignmentType?: HomeworkAssignmentType; // Type (defaults to 'general')
  instructions?: string;                // Instructions (optional)
}

// Previous Homework Response DTO
export interface PreviousHomeworkResponse {
  hasHomework: boolean;                 // Whether previous lesson had homework
  assignment?: HomeworkAssignmentResponse; // Assignment details (if exists)
  previousLessonId?: string;            // Previous lesson ID (if found)
  previousLessonDate?: string;          // Previous lesson date (ISO 8601)
}

// Homework Completion Statistics DTO
export interface HomeworkCompletionStats {
  complete: number;                     // Number of students who completed homework
  partial: number;                      // Number of students with partial completion
  missing: number;                      // Number of students who missed homework
  notChecked: number;                   // Number of students not yet checked
}

// Homework Completion Summary Response DTO
export interface HomeworkCompletionSummaryResponse {
  lessonId: string;                     // GUID of the lesson
  totalStudents: number;                // Total number of enrolled students
  completionStats: HomeworkCompletionStats; // Breakdown by status
  completionRate: number;               // Percentage of students who completed (complete + partial)
  fullCompletionRate: number;           // Percentage of students who fully completed
  hasHomeworkAssignment: boolean;       // Whether the lesson has a homework assignment
}

// Homework Assignment Form Data (for frontend forms)
export interface HomeworkAssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  assignmentType: HomeworkAssignmentType;
  instructions: string;
}

// Homework Management State (for UI state management)
export interface HomeworkManagementState {
  currentAssignment: HomeworkAssignmentResponse | null;
  previousHomework: PreviousHomeworkResponse | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  hasChanges: boolean;
}

// Homework Modal Mode
export type HomeworkModalMode = 'check' | 'assign';

// Homework Assignment Validation Errors
export interface HomeworkAssignmentValidationError {
  field: 'title' | 'description' | 'dueDate' | 'assignmentType' | 'instructions';
  message: string;
}

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

// Assignment type options for UI dropdowns
export const HOMEWORK_ASSIGNMENT_TYPES: readonly HomeworkAssignmentType[] = [
  'general',
  'reading',
  'writing',
  'vocabulary',
  'grammar'
] as const;

// Assignment type display labels
export const HOMEWORK_ASSIGNMENT_TYPE_LABELS: Record<HomeworkAssignmentType, string> = {
  general: 'General',
  reading: 'Reading',
  writing: 'Writing',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar'
} as const;

// Homework assignment icons (for UI)
export const HOMEWORK_ASSIGNMENT_TYPE_ICONS: Record<HomeworkAssignmentType, string> = {
  general: 'BookOpen',
  reading: 'Book',
  writing: 'PenTool',
  vocabulary: 'Library',
  grammar: 'FileText'
} as const;

// Default homework assignment form values
export const DEFAULT_HOMEWORK_ASSIGNMENT: Partial<HomeworkAssignmentFormData> = {
  title: '',
  description: '',
  dueDate: '',
  assignmentType: 'general',
  instructions: ''
} as const;

// Homework assignment validation rules
export const HOMEWORK_VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  INSTRUCTIONS_MAX_LENGTH: 2000,
  TITLE_REQUIRED: true,
  DUE_DATE_FORMAT: 'YYYY-MM-DD'
} as const;

// Type guards
export const isValidAssignmentType = (type: string): type is HomeworkAssignmentType => {
  return HOMEWORK_ASSIGNMENT_TYPES.includes(type as HomeworkAssignmentType);
};

export const isHomeworkAssignmentResponse = (obj: any): obj is HomeworkAssignmentResponse => {
  return obj && 
         typeof obj.id === 'string' &&
         typeof obj.lessonId === 'string' &&
         typeof obj.title === 'string' &&
         isValidAssignmentType(obj.assignmentType) &&
         typeof obj.createdAt === 'string';
};

export const isPreviousHomeworkResponse = (obj: any): obj is PreviousHomeworkResponse => {
  return obj && 
         typeof obj.hasHomework === 'boolean' &&
         (obj.assignment === undefined || isHomeworkAssignmentResponse(obj.assignment));
};

// Utility functions
export const formatDueDate = (dueDate: string | null): string => {
  if (!dueDate) return 'No due date';
  
  try {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dueDate;
  }
};

export const getAssignmentTypeColor = (type: HomeworkAssignmentType): string => {
  const colors: Record<HomeworkAssignmentType, string> = {
    general: 'blue',
    reading: 'green',
    writing: 'purple',
    vocabulary: 'orange',
    grammar: 'red'
  };
  return colors[type] || 'blue';
};

export const isAssignmentOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
    return due < now;
  } catch {
    return false;
  }
};

export const getAssignmentStatus = (assignment: HomeworkAssignmentResponse): 'active' | 'overdue' | 'no_due_date' => {
  if (!assignment.dueDate) return 'no_due_date';
  return isAssignmentOverdue(assignment.dueDate) ? 'overdue' : 'active';
};