/**
 * TypeScript type definitions for Error Handling
 * Standardized error formats and problem details
 */

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ErrorCategory =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not-found'
  | 'conflict'
  | 'server-error'
  | 'network'
  | 'unknown';

// ============================================================================
// PROBLEM DETAILS (RFC 7807)
// ============================================================================

export interface ProblemDetails {
  type: string;                // URI identifying the problem type
  title: string;              // Short, human-readable summary
  status: number;             // HTTP status code
  detail?: string;            // Detailed explanation
  instance?: string;          // URI identifying the specific occurrence
  code?: string;              // Application-specific error code
  traceId?: string;          // Server-side trace ID for debugging
  timestamp?: string;         // ISO 8601 datetime of error
  errors?: ValidationError[]; // Field-level validation errors
  [key: string]: any;        // Allow additional properties
}

export interface ValidationError {
  field: string;             // Field name that failed validation
  code: string;              // Error code for this field
  message: string;           // Human-readable error message
  attemptedValue?: any;     // The value that was rejected
  severity?: ErrorSeverity; // Severity of this error
}

// ============================================================================
// API ERROR RESPONSE
// ============================================================================

export interface ApiError {
  message: string;           // User-friendly message
  code: string;             // Application error code
  status: number;           // HTTP status code
  details?: any;            // Additional details (ProblemDetails or custom)
  severity: ErrorSeverity;  // Error severity
  category: ErrorCategory;  // Error category
  timestamp: string;        // ISO 8601 datetime
  traceId?: string;         // Server-side trace ID
  fieldErrors?: Record<string, string[]>; // Field-level errors
  isRetryable: boolean;     // Can operation be retried
  retryAfterSeconds?: number; // Wait time before retry (for 429)
}

// ============================================================================
// ERROR HANDLING CONTEXT
// ============================================================================

export interface ErrorContext {
  operation: string;        // Operation being performed
  resource?: string;        // Resource type (student, lesson, etc.)
  resourceId?: string;      // ID of the resource
  userId?: string;          // User who triggered the error
  endpoint: string;         // API endpoint that failed
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timestamp: string;        // ISO 8601 datetime
  userAgent?: string;       // Browser/client info
  ipAddress?: string;       // Client IP address
}

export interface ErrorMetadata {
  duration?: number;        // Operation duration in ms
  retryCount?: number;      // Number of retry attempts
  originalError?: string;   // Original error message
  stackTrace?: string;      // Stack trace (development only)
}

// ============================================================================
// ERROR RESPONSES BY HTTP STATUS
// ============================================================================

// 400 Bad Request
export interface BadRequestError extends ApiError {
  status: 400;
  category: 'validation';
  fieldErrors: Record<string, string[]>; // Map of field names to error messages
}

// 401 Unauthorized
export interface UnauthorizedError extends ApiError {
  status: 401;
  category: 'authentication';
  requiresLogin: boolean;
}

// 403 Forbidden
export interface ForbiddenError extends ApiError {
  status: 403;
  category: 'authorization';
  requiredPermissions?: string[];
}

// 404 Not Found
export interface NotFoundError extends ApiError {
  status: 404;
  category: 'not-found';
  resourceType: string;
  resourceId: string;
}

// 409 Conflict
export interface ConflictError extends ApiError {
  status: 409;
  category: 'conflict';
  conflictField?: string;
  existingValue?: any;
}

// 429 Too Many Requests
export interface RateLimitError extends ApiError {
  status: 429;
  category: 'validation'; // Rate limit is a form of validation
  retryAfterSeconds: number;
}

// 5xx Server Error
export interface ServerError extends ApiError {
  status: 500 | 502 | 503 | 504;
  category: 'server-error';
  isRetryable: true;
  retryAfterSeconds?: number; // For 503 Unavailable
}

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean; // Add randomness to prevent thundering herd
}

export interface ErrorRecoveryStrategy {
  shouldRetry: (error: ApiError) => boolean;
  shouldRethrow: (error: ApiError) => boolean;
  getFallbackValue: (error: ApiError) => any; // Return fallback for failed operation
  getRetryDelay: (attempt: number, error: ApiError) => number; // Milliseconds to wait
}

// ============================================================================
// ERROR TRACKING & REPORTING
// ============================================================================

export interface ErrorReport {
  id: string;               // GUID of error report
  error: ApiError;
  context: ErrorContext;
  metadata: ErrorMetadata;
  sessionId?: string;
  userId?: string;
  url?: string;
  referrer?: string;
  timestamp: string;        // ISO 8601 datetime
  resolved?: boolean;
}

export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByStatus: Record<number, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{
    code: string;
    message: string;
    count: number;
    lastOccurred: string;
  }>;
  averageResolutionTime?: number; // In minutes
  affectedUsers?: number;
}

// ============================================================================
// ERROR CONVERSION
// ============================================================================

export function isApiError(obj: any): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.message === 'string' &&
    typeof obj.code === 'string' &&
    typeof obj.status === 'number' &&
    ['info', 'warning', 'error', 'critical'].includes(obj.severity) &&
    typeof obj.timestamp === 'string' &&
    typeof obj.isRetryable === 'boolean'
  );
}

export function isProblemDetails(obj: any): obj is ProblemDetails {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'number'
  );
}

// Convert HTTP error responses to ApiError format
export function toProblemDetails(error: any): ProblemDetails {
  if (isProblemDetails(error)) {
    return error;
  }

  return {
    type: 'about:blank',
    title: error?.message || 'An error occurred',
    status: error?.status || 500,
    detail: error?.detail,
    code: error?.code,
  };
}

export function toApiError(error: any, status: number = 500): ApiError {
  // If already an ApiError, return it
  if (isApiError(error)) {
    return error;
  }

  // Determine category from status
  let category: ErrorCategory = 'unknown';
  let severity: ErrorSeverity = 'error';
  let isRetryable = false;

  if (status === 400) {
    category = 'validation';
    severity = 'warning';
  } else if (status === 401) {
    category = 'authentication';
    severity = 'error';
  } else if (status === 403) {
    category = 'authorization';
    severity = 'error';
  } else if (status === 404) {
    category = 'not-found';
    severity = 'warning';
  } else if (status === 409) {
    category = 'conflict';
    severity = 'warning';
  } else if (status === 429) {
    category = 'validation';
    severity = 'info';
    isRetryable = true;
  } else if (status >= 500) {
    category = 'server-error';
    severity = 'critical';
    isRetryable = true;
  }

  // Create ApiError from various input types
  const problemDetails = toProblemDetails(error);

  return {
    message: problemDetails.title || error?.message || 'An error occurred',
    code: problemDetails.code || error?.code || 'UNKNOWN_ERROR',
    status,
    details: problemDetails,
    severity,
    category,
    timestamp: new Date().toISOString(),
    traceId: problemDetails.traceId,
    fieldErrors: problemDetails.errors ?
      problemDetails.errors.reduce((acc: any, err: ValidationError) => {
        if (!acc[err.field]) acc[err.field] = [];
        acc[err.field].push(err.message);
        return acc;
      }, {})
      : undefined,
    isRetryable,
    retryAfterSeconds: status === 429 ? error?.retryAfter || 60 : undefined,
  };
}

// ============================================================================
// RETRY STRATEGY HELPERS
// ============================================================================

export const DefaultRetryPolicy: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: true,
};

export function calculateRetryDelay(
  attempt: number,
  policy: RetryPolicy = DefaultRetryPolicy
): number {
  const baseDelay = Math.min(
    policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1),
    policy.maxDelayMs
  );

  if (policy.jitter) {
    const jitterAmount = baseDelay * 0.1; // 10% jitter
    return baseDelay + (Math.random() * jitterAmount - jitterAmount / 2);
  }

  return baseDelay;
}

export function isRetryableError(error: ApiError): boolean {
  // Retry on server errors and rate limit errors
  if (error.status >= 500 || error.status === 429) {
    return true;
  }

  // Retry on specific network errors
  if (error.category === 'network') {
    return true;
  }

  return error.isRetryable;
}

// ============================================================================
// ERROR MESSAGES (User-Friendly)
// ============================================================================

export const ErrorMessages = {
  // Network
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EXPIRED_SESSION: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',

  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Invalid email format.',
  INVALID_DATE: 'Invalid date format.',
  INVALID_NUMBER: 'Invalid number format.',

  // Conflicts
  DUPLICATE_ENTRY: 'An entry with this value already exists.',
  VERSION_CONFLICT: 'The resource has been modified. Please refresh and try again.',

  // Server
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
} as const;
