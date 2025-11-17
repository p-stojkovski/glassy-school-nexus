/**
 * TypeScript type definitions for Authentication & Authorization API
 * Manages user authentication, permissions, and roles
 */

// ============================================================================
// USER ROLES & PERMISSIONS
// ============================================================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'staff';

export type PermissionScope =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'approve'
  | 'reject';

export type ResourcePermission =
  | 'students'
  | 'teachers'
  | 'classes'
  | 'lessons'
  | 'attendance'
  | 'grades'
  | 'finance'
  | 'settings'
  | 'audit'
  | 'users'
  | 'all';

export interface Permission {
  resource: ResourcePermission;
  scopes: PermissionScope[];
}

export interface RoleDefinition {
  id: string;                 // GUID
  name: UserRole;            // Role name
  displayName: string;       // User-friendly name
  description: string;       // Role description
  permissions: Permission[]; // List of permissions
  isSystem: boolean;        // Cannot be deleted if true
  createdAt?: string;       // ISO 8601 datetime
  updatedAt?: string;       // ISO 8601 datetime
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface UserProfile {
  id: string;               // GUID
  email: string;           // Unique email
  firstName: string;       // First name
  lastName: string;        // Last name
  fullName?: string;       // Derived full name
  role: UserRole;          // User role
  permissions: Permission[]; // Computed permissions
  isActive: boolean;
  lastLogin?: string;      // ISO 8601 datetime
  createdAt?: string;      // ISO 8601 datetime
  updatedAt?: string;      // ISO 8601 datetime
}

export interface AuthTokens {
  accessToken: string;     // JWT access token
  refreshToken: string;    // JWT refresh token
  expiresIn: number;       // Token expiration in seconds
  tokenType: 'Bearer';     // Always 'Bearer'
}

export interface LoginRequest {
  email: string;           // Required: valid email
  password: string;        // Required: non-empty password
  rememberMe?: boolean;    // Optional: keep login session
}

export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;    // Required: valid refresh token
}

export interface ChangePasswordRequest {
  currentPassword: string; // Required
  newPassword: string;     // Required: minimum 8 chars
  confirmPassword: string; // Required: must match newPassword
}

export interface ResetPasswordRequest {
  email: string;          // Required: registered email
}

export interface ConfirmPasswordResetRequest {
  token: string;          // Required: reset token from email
  newPassword: string;    // Required
  confirmPassword: string; // Required: must match newPassword
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string; // Required if changing email
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

export interface PermissionCheckRequest {
  resource: ResourcePermission;
  scope: PermissionScope;
}

export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string; // Why permission was denied
}

export interface RolePermissionMatrix {
  [key in UserRole]?: Permission[];
}

// ============================================================================
// SESSION & SECURITY
// ============================================================================

export interface SessionInfo {
  sessionId: string;      // GUID of session
  userId: string;         // GUID of user
  email: string;
  role: UserRole;
  ipAddress: string;      // IP of login
  userAgent: string;      // Browser info
  loginTime: string;      // ISO 8601 datetime
  lastActivityTime: string; // ISO 8601 datetime
  expiresAt: string;      // ISO 8601 datetime
  isActive: boolean;
}

export interface AuditableAction {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;     // ISO 8601 datetime
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// API ENDPOINT PATHS
// ============================================================================

export const AuthApiPaths = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  PROFILE: '/api/auth/profile',
  PROFILE_UPDATE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
  REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
  CONFIRM_PASSWORD_RESET: '/api/auth/confirm-password-reset',
  CHECK_PERMISSION: '/api/auth/check-permission',
  SESSIONS: '/api/auth/sessions',
  SESSIONS_BY_ID: (id: string) => `/api/auth/sessions/${id}`,
  ROLES: '/api/auth/roles',
  ROLES_BY_ID: (id: string) => `/api/auth/roles/${id}`,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum AuthErrorCodes {
  // Authentication Errors
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_DISABLED = 'account_disabled',
  ACCOUNT_NOT_FOUND = 'account_not_found',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  INVALID_TOKEN = 'invalid_token',
  EXPIRED_TOKEN = 'expired_token',
  REFRESH_TOKEN_EXPIRED = 'refresh_token_expired',

  // Authorization Errors
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  ROLE_NOT_FOUND = 'role_not_found',
  PERMISSION_DENIED = 'permission_denied',

  // Password Errors
  INVALID_PASSWORD = 'invalid_password',
  PASSWORD_MISMATCH = 'password_mismatch',
  PASSWORD_REQUIREMENTS_NOT_MET = 'password_requirements_not_met',
  SAME_PASSWORD = 'same_password',

  // Session Errors
  SESSION_EXPIRED = 'session_expired',
  SESSION_NOT_FOUND = 'session_not_found',
  CONCURRENT_SESSION_LIMIT = 'concurrent_session_limit',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',

  // Profile Errors
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  PROFILE_NOT_FOUND = 'profile_not_found',

  // General Errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  INVALID_REQUEST = 'invalid_request',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum AuthHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidUserRole(role: string): role is UserRole {
  return ['admin', 'teacher', 'student', 'parent', 'staff'].includes(role);
}

export function isValidPermissionScope(scope: string): scope is PermissionScope {
  return ['read', 'create', 'update', 'delete', 'manage', 'export', 'approve', 'reject'].includes(scope);
}

export function isValidResourcePermission(resource: string): resource is ResourcePermission {
  return [
    'students', 'teachers', 'classes', 'lessons', 'attendance',
    'grades', 'finance', 'settings', 'audit', 'users', 'all'
  ].includes(resource);
}

export function isUserProfile(obj: any): obj is UserProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    isValidUserRole(obj.role) &&
    Array.isArray(obj.permissions) &&
    typeof obj.isActive === 'boolean'
  );
}

export function isAuthTokens(obj: any): obj is AuthTokens {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.accessToken === 'string' &&
    typeof obj.refreshToken === 'string' &&
    typeof obj.expiresIn === 'number' &&
    obj.tokenType === 'Bearer'
  );
}

export function isLoginResponse(obj: any): obj is LoginResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isUserProfile(obj.user) &&
    isAuthTokens(obj.tokens)
  );
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const AuthValidationRules = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    ERROR_MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGE: 'Invalid email format',
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    ERROR_MESSAGE: 'Username can only contain alphanumeric characters, underscores, and hyphens',
  },
  SESSION: {
    MAX_DURATION_HOURS: 24,
    IDLE_TIMEOUT_MINUTES: 30,
  },
  LOGIN: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
  },
} as const;

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export interface SecurityHeaders {
  'X-Content-Type-Options': 'nosniff';
  'X-Frame-Options': 'DENY';
  'X-XSS-Protection': '1; mode=block';
  'Strict-Transport-Security': string; // e.g., "max-age=31536000; includeSubDomains"
  'Content-Security-Policy': string;
  'Referrer-Policy': 'strict-origin-when-cross-origin';
}
