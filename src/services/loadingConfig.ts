/**
 * Configuration for controlling loading behavior across endpoints
 */

// Endpoints that should NEVER show global loading
const SKIP_LOADING_ENDPOINTS = [
  // Authentication endpoints
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/me',
  
  // Real-time features
  '/api/teachers/',
  '/api/subjects/',
  // '/api/teachers/search',
  '/api/students/search',
  '/api/classes/search',
  
  // Class form page dependencies (use local loading states)
  '/api/teachers',
  '/api/classrooms',
  
  // Background operations
  '/api/analytics',
  '/api/health',
  '/api/heartbeat',
  
  // Auto-save operations
  '/api/drafts',
  '/api/autosave',
  
  // Polling endpoints
  '/api/notifications/poll',
  '/api/status/poll',
];

// Endpoints that should show loading for specific HTTP methods only
const METHOD_SPECIFIC_LOADING = {
  // Only show loading for POST/PUT/DELETE, not GET
  '/api/cache': ['POST', 'PUT', 'DELETE'],
  
  // Only show loading for DELETE operations
  '/api/temporary-data': ['DELETE'],
};

/**
 * Check if an endpoint should skip global loading
 */
export function shouldSkipGlobalLoading(endpoint: string, method?: string): boolean {
  // Remove query parameters for matching
  const cleanEndpoint = endpoint.split('?')[0];
  
  // Check exact matches
  if (SKIP_LOADING_ENDPOINTS.includes(cleanEndpoint)) {
    return true;
  }
  
  // Check pattern matches
  const skipPatterns = [
    /\/api\/search/,           // Any search endpoint
    /\/api\/autocomplete/,     // Autocomplete endpoints
    /\/api\/suggestions/,      // Suggestion endpoints
    /\/api\/validate/,         // Validation endpoints
    /\/api\/ping/,             // Health check endpoints
    /\/api\/.*\/poll$/,        // Polling endpoints
  ];
  
  if (skipPatterns.some(pattern => pattern.test(cleanEndpoint))) {
    return true;
  }
  
  // Check method-specific rules
  if (method && METHOD_SPECIFIC_LOADING[cleanEndpoint]) {
    return !METHOD_SPECIFIC_LOADING[cleanEndpoint].includes(method.toUpperCase());
  }
  
  return false;
}

/**
 * Add endpoint to skip loading list
 */
export function addSkipLoadingEndpoint(endpoint: string): void {
  if (!SKIP_LOADING_ENDPOINTS.includes(endpoint)) {
    SKIP_LOADING_ENDPOINTS.push(endpoint);
  }
}

/**
 * Remove endpoint from skip loading list
 */
export function removeSkipLoadingEndpoint(endpoint: string): void {
  const index = SKIP_LOADING_ENDPOINTS.indexOf(endpoint);
  if (index > -1) {
    SKIP_LOADING_ENDPOINTS.splice(index, 1);
  }
}

/**
 * Get all endpoints that skip loading
 */
export function getSkipLoadingEndpoints(): string[] {
  return [...SKIP_LOADING_ENDPOINTS];
}

/**
 * Configuration object for easy imports
 */
export const LoadingConfig = {
  shouldSkip: shouldSkipGlobalLoading,
  addSkipEndpoint: addSkipLoadingEndpoint,
  removeSkipEndpoint: removeSkipLoadingEndpoint,
  getSkipEndpoints: getSkipLoadingEndpoints,
} as const;
