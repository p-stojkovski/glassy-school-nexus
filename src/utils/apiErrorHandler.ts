/**
 * Centralized API Error Handler
 * Provides consistent error handling and user notifications across the application
 */

import { toast } from 'sonner';
import { ClassroomHttpStatus } from '@/types/api/classroom';
import { TeacherHttpStatus } from '@/types/api/teacher';
import { StudentHttpStatus } from '@/types/api/student';

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

export interface ErrorHandlerOptions {
  /** Custom error message to display instead of the default */
  customMessage?: string;
  /** Whether to show the toast notification (default: true) */
  showToast?: boolean;
  /** Operation context for better error messages */
  operation?: string;
  /** Whether to log the error to console (default: true) */
  logError?: boolean;
}

/**
 * Centralized error handler that formats and displays appropriate error messages
 * @param error - The error object from API calls
 * @param options - Configuration options for error handling
 * @returns Formatted error message
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  const {
    customMessage,
    showToast = true,
    operation = 'operation',
    logError = true,
  } = options;

  let errorMessage: string;
  let isUserFriendly = false;

  if (error instanceof Error) {
    const apiError = error as ApiError;

    // Log error for debugging (except for expected user errors)
    if (logError && !isExpectedUserError(apiError.status)) {
      console.error(`API Error during ${operation}:`, {
        message: error.message,
        status: apiError.status,
        details: apiError.details,
        stack: error.stack,
      });
    }

    // Use custom message if provided
    if (customMessage) {
      errorMessage = customMessage;
      isUserFriendly = true;
    } else {
      // Format error message based on status code
      const result = formatErrorMessage(apiError, operation);
      errorMessage = result.message;
      isUserFriendly = result.isUserFriendly;
    }
  } else {
    // Handle unknown error types
    errorMessage = customMessage || `Failed to ${operation}. Please try again.`;
    if (logError) {
      console.error(`Unknown error during ${operation}:`, error);
    }
  }

  // Show toast notification if requested
  if (showToast) {
    showErrorToast(errorMessage, isUserFriendly);
  }

  return errorMessage;
}

/**
 * Show success notification
 * @param message - Success message to display
 * @param description - Optional description
 */
export function showSuccessMessage(message: string, description?: string): void {
  toast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show error notification
 * @param message - Error message to display
 * @param isUserFriendly - Whether this is a user-friendly error
 */
export function showErrorToast(message: string, isUserFriendly: boolean = false): void {
  toast.error('Error', {
    description: message,
    duration: isUserFriendly ? 5000 : 6000, // Show user-friendly errors a bit longer
    action: !isUserFriendly ? {
      label: 'Retry',
      onClick: () => {
        // Let parent component handle retry logic
        toast.info('Please try your action again', { duration: 2000 });
      },
    } : undefined,
  });
}

/**
 * Show warning notification
 * @param message - Warning message to display
 * @param description - Optional description
 */
export function showWarningMessage(message: string, description?: string): void {
  toast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show info notification
 * @param message - Info message to display
 * @param description - Optional description
 */
export function showInfoMessage(message: string, description?: string): void {
  toast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * Format error message based on HTTP status code and error details
 * @param error - API error object
 * @param operation - Operation context
 * @returns Formatted message and user-friendliness indicator
 */
function formatErrorMessage(
  error: ApiError,
  operation: string
): { message: string; isUserFriendly: boolean } {
  const status = error.status;

  switch (status) {
    case ClassroomHttpStatus.BAD_REQUEST:
      // Validation errors are user-friendly
      if (error.message.includes('Validation error')) {
        return { 
          message: error.message,
          isUserFriendly: true 
        };
      }
      return { 
        message: error.message || `Invalid data provided for ${operation}`,
        isUserFriendly: true 
      };

    case ClassroomHttpStatus.UNAUTHORIZED:
      return { 
        message: 'Your session has expired. Please log in again.',
        isUserFriendly: true 
      };

    case ClassroomHttpStatus.FORBIDDEN:
      return { 
        message: 'You do not have permission to perform this action.',
        isUserFriendly: true 
      };

    case ClassroomHttpStatus.NOT_FOUND:
      return { 
        message: error.message || 'The requested item was not found.',
        isUserFriendly: true 
      };

    case ClassroomHttpStatus.CONFLICT:
      return { 
        message: error.message || 'This action conflicts with existing data.',
        isUserFriendly: true 
      };

    case ClassroomHttpStatus.INTERNAL_SERVER_ERROR:
      return { 
        message: 'A server error occurred. Our team has been notified.',
        isUserFriendly: false 
      };

    case 0:
    case undefined:
      // Network errors
      return { 
        message: 'Unable to connect to the server. Please check your internet connection.',
        isUserFriendly: false 
      };

    default:
      // Use the error message if it's available and seems user-friendly
      if (error.message && !error.message.toLowerCase().includes('fetch')) {
        return { 
          message: error.message,
          isUserFriendly: true 
        };
      }
      return { 
        message: `Failed to ${operation}. Please try again.`,
        isUserFriendly: false 
      };
  }
}

/**
 * Check if an error status represents an expected user error (not a system error)
 * @param status - HTTP status code
 * @returns Whether this is an expected user error
 */
function isExpectedUserError(status?: number): boolean {
  return !!(status && [
    ClassroomHttpStatus.BAD_REQUEST,
    ClassroomHttpStatus.UNAUTHORIZED,
    ClassroomHttpStatus.FORBIDDEN,
    ClassroomHttpStatus.NOT_FOUND,
    ClassroomHttpStatus.CONFLICT,
  ].includes(status));
}

/**
 * Wrapper for API operations with automatic error handling
 * @param operation - The async operation to execute
 * @param options - Error handling options
 * @returns Promise with the operation result
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, options);
    throw error; // Re-throw so caller can handle if needed
  }
}

/**
 * Specific error handlers for common classroom operations
 */
export const ClassroomErrorHandlers = {
  fetchAll: (error: unknown) => 
    handleApiError(error, { operation: 'fetch classrooms' }),
  
  fetchById: (error: unknown) => 
    handleApiError(error, { operation: 'fetch classroom details' }),
  
  search: (error: unknown) => 
    handleApiError(error, { operation: 'search classrooms' }),
  
  create: (error: unknown) => 
    handleApiError(error, { operation: 'create classroom' }),
  
  update: (error: unknown) => 
    handleApiError(error, { operation: 'update classroom' }),
  
  delete: (error: unknown) => 
    handleApiError(error, { operation: 'delete classroom' }),
  
  checkName: (error: unknown) => 
    handleApiError(error, { 
      operation: 'check name availability',
      showToast: false, // Don't show toast for name checking
      logError: false,  // Don't log these as they're expected during typing
    }),
};

/**
 * Specific error handlers for common teacher operations
 */
export const TeacherErrorHandlers = {
  fetchAll: (error: unknown) => 
    handleApiError(error, { operation: 'fetch teachers' }),
  
  fetchById: (error: unknown) => 
    handleApiError(error, { operation: 'fetch teacher details' }),
  
  search: (error: unknown) => 
    handleApiError(error, { operation: 'search teachers' }),
  
  create: (error: unknown) => {
    const apiError = error as ApiError;
    // Provide more specific messages for teacher creation errors
    if (apiError.status === TeacherHttpStatus.CONFLICT) {
      if (apiError.message?.includes('email')) {
        return handleApiError(error, {
          customMessage: 'A teacher with this email address already exists. Please use a different email.',
          operation: 'create teacher'
        });
      }
    }
    if (apiError.status === TeacherHttpStatus.BAD_REQUEST) {
      if (apiError.message?.includes('Subject')) {
        return handleApiError(error, {
          customMessage: 'The selected subject is no longer available. Please choose a different subject.',
          operation: 'create teacher'
        });
      }
    }
    return handleApiError(error, { operation: 'create teacher' });
  },
  
  update: (error: unknown) => {
    const apiError = error as ApiError;
    // Provide more specific messages for teacher update errors
    if (apiError.status === TeacherHttpStatus.CONFLICT) {
      if (apiError.message?.includes('email')) {
        return handleApiError(error, {
          customMessage: 'Another teacher is already using this email address. Please use a different email.',
          operation: 'update teacher'
        });
      }
    }
    if (apiError.status === TeacherHttpStatus.BAD_REQUEST) {
      if (apiError.message?.includes('Subject')) {
        return handleApiError(error, {
          customMessage: 'The selected subject is no longer available. Please choose a different subject.',
          operation: 'update teacher'
        });
      }
    }
    return handleApiError(error, { operation: 'update teacher' });
  },
  
  delete: (error: unknown) => {
    const apiError = error as ApiError;
    // Handle teacher deletion with class assignments
    if (apiError.status === TeacherHttpStatus.CONFLICT) {
      if (apiError.message?.includes('class')) {
        return handleApiError(error, {
          customMessage: apiError.message || 'Cannot delete teacher because they have assigned classes. Please reassign their classes first.',
          operation: 'delete teacher'
        });
      }
    }
    return handleApiError(error, { operation: 'delete teacher' });
  },
  
  fetchSubjects: (error: unknown) => 
    handleApiError(error, { operation: 'fetch subjects' }),
};

/**
 * Specific error handlers for common student operations
 */
export const StudentErrorHandlers = {
  fetchAll: (error: unknown) =>
    handleApiError(error, { operation: 'fetch students' }),

  fetchById: (error: unknown) =>
    handleApiError(error, { operation: 'fetch student details' }),

  search: (error: unknown) =>
    handleApiError(error, { operation: 'search students' }),

  create: (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === StudentHttpStatus.CONFLICT) {
      if (apiError.message?.toLowerCase()?.includes('email')) {
        return handleApiError(error, {
          customMessage: 'A student with this email address already exists. Please use a different email.',
          operation: 'create student',
        });
      }
    }
    if (apiError.status === StudentHttpStatus.BAD_REQUEST) {
      if (apiError.message?.includes('Discount')) {
        return handleApiError(error, {
          customMessage: 'The selected discount type is no longer available. Please choose a different discount type.',
          operation: 'create student',
        });
      }
    }
    return handleApiError(error, { operation: 'create student' });
  },

  update: (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === StudentHttpStatus.CONFLICT) {
      if (apiError.message?.toLowerCase()?.includes('email')) {
        return handleApiError(error, {
          customMessage: 'Another student is already using this email address. Please use a different email.',
          operation: 'update student',
        });
      }
    }
    if (apiError.status === StudentHttpStatus.BAD_REQUEST) {
      if (apiError.message?.includes('Discount')) {
        return handleApiError(error, {
          customMessage: 'The selected discount type is no longer available. Please choose a different discount type.',
          operation: 'update student',
        });
      }
    }
    return handleApiError(error, { operation: 'update student' });
  },

  delete: (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === StudentHttpStatus.CONFLICT) {
      if (apiError.message?.toLowerCase()?.includes('dependenc')) {
        return handleApiError(error, {
          customMessage: apiError.message || 'Cannot delete student because they have existing enrollments or payment records. Please clear related data first.',
          operation: 'delete student',
        });
      }
    }
    return handleApiError(error, { operation: 'delete student' });
  },

  fetchDiscountTypes: (error: unknown) =>
    handleApiError(error, { operation: 'fetch discount types' }),
};

export const ClassErrorHandlers = {
  fetchAll: (error: unknown) => handleApiError(error, { operation: 'fetch classes' }),
  fetchById: (error: unknown) => handleApiError(error, { operation: 'fetch class details' }),
  search: (error: unknown) => handleApiError(error, { operation: 'search classes' }),
  create: (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === 409) { // Conflict
      return handleApiError(error, {
        customMessage: apiError.details?.detail || apiError.message || 'Conflict occurred while creating class.',
        operation: 'create class',
        showToast: true
      });
    }
    return handleApiError(error, { operation: 'create class' });
  },
  update: (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.status === 409) { // Conflict
      return handleApiError(error, {
        customMessage: apiError.details?.detail || apiError.message || 'Conflict occurred while updating class.',
        operation: 'update class',
        showToast: true
      });
    }
    return handleApiError(error, { operation: 'update class' });
  },
  delete: (error: unknown) => handleApiError(error, { operation: 'delete class' }),
};

export default {
  handleApiError,
  showSuccessMessage,
  showErrorToast,
  showWarningMessage,
  showInfoMessage,
  withErrorHandling,
  ClassroomErrorHandlers,
  TeacherErrorHandlers,
};
