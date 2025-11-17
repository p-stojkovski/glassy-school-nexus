/**
 * TypeScript type definitions for the Audit System API
 * Tracks system activities, changes, and user actions
 */

// ============================================================================
// AUDIT ACTIVITY TYPES
// ============================================================================

export type AuditActionType =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'PUBLISH'
  | 'ARCHIVE';

export type AuditResourceType =
  | 'student'
  | 'teacher'
  | 'class'
  | 'classroom'
  | 'lesson'
  | 'attendance'
  | 'homework'
  | 'grade'
  | 'payment'
  | 'obligation'
  | 'academic-year'
  | 'semester'
  | 'teaching-break'
  | 'user'
  | 'settings';

export type AuditStatus = 'success' | 'failure' | 'partial';

// ============================================================================
// AUDIT LOG RESPONSE
// ============================================================================

export interface AuditLogResponse {
  id: string;                      // GUID of audit log entry
  action: AuditActionType;         // Action performed
  resourceType: AuditResourceType; // Type of resource affected
  resourceId: string;              // ID of affected resource
  resourceName?: string;           // Human-readable name of resource
  userId: string;                  // GUID of user who performed action
  userName: string;                // Name of user who performed action
  status: AuditStatus;             // Result of action
  changes?: Record<string, unknown>; // Before/after values for updates
  ipAddress?: string;              // IP address of request origin
  userAgent?: string;              // Browser/client information
  errorMessage?: string;           // Error details if status is 'failure'
  timestamp: string;               // ISO 8601 datetime of action
  durationMs?: number;             // Duration of operation in milliseconds
}

// ============================================================================
// AUDIT LOG QUERY RESPONSE
// ============================================================================

export interface GetAuditLogsResponse {
  items: AuditLogResponse[];
  totalCount: number;              // Total matching entries
  pageSize: number;
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAuditStatsResponse {
  totalActions: number;
  successCount: number;
  failureCount: number;
  partialCount: number;
  actionBreakdown: Record<AuditActionType, number>;
  resourceBreakdown: Record<AuditResourceType, number>;
  topUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  timeRangeStart: string;          // ISO 8601 date
  timeRangeEnd: string;            // ISO 8601 date
}

// ============================================================================
// AUDIT LOG QUERY PARAMETERS
// ============================================================================

export interface GetAuditLogsParams {
  action?: AuditActionType;                      // Filter by action type
  resourceType?: AuditResourceType;              // Filter by resource type
  resourceId?: string;                           // Filter by specific resource
  userId?: string;                               // Filter by user
  status?: AuditStatus;                          // Filter by status
  startDate?: string;                            // ISO 8601 date
  endDate?: string;                              // ISO 8601 date
  pageNumber?: number;                           // Default: 1
  pageSize?: number;                             // Default: 50, max: 1000
  sortBy?: 'timestamp' | 'action' | 'resource'; // Default: 'timestamp'
  sortOrder?: 'asc' | 'desc';                   // Default: 'desc'
}

export interface GetAuditStatsParams {
  startDate: string;               // ISO 8601 date
  endDate: string;                 // ISO 8601 date
  action?: AuditActionType;        // Optional filter
  resourceType?: AuditResourceType; // Optional filter
}

// ============================================================================
// API ENDPOINT PATHS
// ============================================================================

export const AuditApiPaths = {
  LOGS_BASE: '/api/audit/logs',
  LOGS_BY_ID: (id: string) => `/api/audit/logs/${id}`,
  LOGS_EXPORT: '/api/audit/logs/export',
  STATS: '/api/audit/statistics',
  CLEANUP: '/api/audit/cleanup',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum AuditErrorCodes {
  AUDIT_LOG_NOT_FOUND = 'audit_log_not_found',
  INVALID_DATE_RANGE = 'invalid_date_range',
  DATE_RANGE_TOO_LARGE = 'date_range_too_large',
  INVALID_ACTION_TYPE = 'invalid_action_type',
  INVALID_RESOURCE_TYPE = 'invalid_resource_type',
  INVALID_STATUS = 'invalid_status',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  EXPORT_FAILED = 'export_failed',
  CLEANUP_FAILED = 'cleanup_failed',
  DATABASE_ERROR = 'database_error',
  RETRIEVAL_ERROR = 'retrieval_error',
}

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum AuditHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidActionType(action: string): action is AuditActionType {
  return ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'PUBLISH', 'ARCHIVE'].includes(action);
}

export function isValidResourceType(resource: string): resource is AuditResourceType {
  return [
    'student', 'teacher', 'class', 'classroom', 'lesson', 'attendance',
    'homework', 'grade', 'payment', 'obligation', 'academic-year',
    'semester', 'teaching-break', 'user', 'settings'
  ].includes(resource);
}

export function isValidAuditStatus(status: string): status is AuditStatus {
  return ['success', 'failure', 'partial'].includes(status);
}

export function isAuditLogResponse(obj: any): obj is AuditLogResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    isValidActionType(obj.action) &&
    isValidResourceType(obj.resourceType) &&
    typeof obj.resourceId === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.userName === 'string' &&
    isValidAuditStatus(obj.status) &&
    typeof obj.timestamp === 'string' &&
    (obj.changes === undefined || typeof obj.changes === 'object')
  );
}

export function isGetAuditLogsResponse(obj: any): obj is GetAuditLogsResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.items) &&
    obj.items.every(isAuditLogResponse) &&
    typeof obj.totalCount === 'number' &&
    typeof obj.pageSize === 'number' &&
    typeof obj.pageNumber === 'number' &&
    typeof obj.hasNextPage === 'boolean' &&
    typeof obj.hasPreviousPage === 'boolean'
  );
}

export function isGetAuditStatsResponse(obj: any): obj is GetAuditStatsResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.totalActions === 'number' &&
    typeof obj.successCount === 'number' &&
    typeof obj.failureCount === 'number' &&
    typeof obj.partialCount === 'number' &&
    typeof obj.actionBreakdown === 'object' &&
    typeof obj.resourceBreakdown === 'object' &&
    Array.isArray(obj.topUsers) &&
    typeof obj.timeRangeStart === 'string' &&
    typeof obj.timeRangeEnd === 'string'
  );
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const AuditValidationRules = {
  DATE_RANGE: {
    MAX_DAYS: 90, // Maximum 90-day audit log query
    ERROR_MESSAGE: 'Date range cannot exceed 90 days',
  },
  PAGINATION: {
    MIN_PAGE_SIZE: 1,
    MAX_PAGE_SIZE: 1000,
    DEFAULT_PAGE_SIZE: 50,
    ERROR_MESSAGE: 'Page size must be between 1 and 1000',
  },
  EXPORT: {
    MAX_ROWS: 50000,
    SUPPORTED_FORMATS: ['csv', 'json', 'xlsx'],
    ERROR_MESSAGE: 'Export limited to 50000 rows maximum',
  },
} as const;
