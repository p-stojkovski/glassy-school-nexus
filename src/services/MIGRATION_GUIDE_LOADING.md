# Global Loading Interceptor Migration Guide

## Overview

We've implemented a global loading interceptor that automatically shows a loading overlay for all API calls. This eliminates the need for manual loading state management in components.

## Architecture

### 1. **Loading Slice** (`store/slices/loadingSlice.ts`)
- Manages global loading state in Redux
- Tracks active requests count
- Supports operation-specific loading states
- Prevents loading flicker with minimum duration (300ms)

### 2. **API Service with Interceptor** (`services/apiWithInterceptor.ts`)
- Wraps all API calls with automatic loading management
- Supports opt-out via `skipGlobalLoading` option
- Maintains all existing API functionality
- Handles auth token refresh and retries

### 3. **Global Loading Overlay** (`components/common/GlobalLoadingOverlay.tsx`)
- Beautiful full-screen loading overlay
- Automatically shows/hides based on Redux state
- Smooth animations with Framer Motion
- Non-intrusive design

## Migration Steps

### Step 1: Update API Service Imports

**Before:**
```typescript
import apiService from '@/services/api';

// In your service
const data = await apiService.get('/api/endpoint');
```

**After:**
```typescript
import apiWithInterceptor from '@/services/apiWithInterceptor';

// In your service
const data = await apiWithInterceptor.get('/api/endpoint');
```

### Step 2: Remove Manual Loading States

**Before:**
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiService.get('/api/endpoint');
    // process data
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const fetchData = async () => {
  const data = await apiWithInterceptor.get('/api/endpoint');
  // process data - loading is automatic!
};
```

### Step 3: Handle Special Cases

#### Skip Loading for Specific Calls
```typescript
// For calls that shouldn't show global loading
const data = await apiWithInterceptor.get('/api/endpoint', {
  skipGlobalLoading: true
});
```

#### Track Operation-Specific Loading
```typescript
// For operations that need individual tracking
const data = await apiWithInterceptor.post('/api/endpoint', data, {
  operationId: 'create-teacher'
});

// In component
const isCreatingTeacher = useSelector(selectIsOperationLoading('create-teacher'));
```

#### Configure Automatic Loading Control
```typescript
import { LoadingConfig } from '@/services/loadingConfig';

// Add endpoint to automatic skip list
LoadingConfig.addSkipEndpoint('/api/my-endpoint');

// Remove from skip list
LoadingConfig.removeSkipEndpoint('/api/my-endpoint');

// Check if endpoint would skip loading
const shouldSkip = LoadingConfig.shouldSkip('/api/teachers/search', 'GET');
```

## Loading Control Options

### 1. Request-Level Options
The interceptor supports these options:

```typescript
interface RequestOptions {
  skipGlobalLoading?: boolean;  // Skip global loading for this request
  operationId?: string;         // Track specific operation loading state
  headers?: Record<string, string>; // Custom headers
}
```

### 2. Automatic Configuration
Endpoints that automatically skip loading:

- **Authentication**: `/api/auth/*` (login, logout, refresh, etc.)
- **Search**: `/api/*/search` (all search endpoints)
- **Real-time**: `/api/autocomplete`, `/api/suggestions`, `/api/validate`
- **Background**: `/api/analytics`, `/api/health`, `/api/heartbeat`
- **Polling**: `/api/*/poll` (status polling, notifications)

### 3. Service-Level Control
```typescript
// Disable loading for entire service
teacherApiService.disableGlobalLoading();

// Re-enable loading
teacherApiService.enableGlobalLoading();
```

### 4. Dynamic Configuration
```typescript
import { LoadingConfig } from '@/services/loadingConfig';

// Runtime configuration
LoadingConfig.addSkipEndpoint('/api/custom-endpoint');
LoadingConfig.removeSkipEndpoint('/api/custom-endpoint');
LoadingConfig.getSkipEndpoints(); // Get all skip endpoints
```

## Examples

### Basic Usage
```typescript
// Automatic loading - no extra code needed!
const teachers = await apiWithInterceptor.get('/api/teachers');
```

### Automatic Smart Loading
```typescript
// These automatically skip loading (configured in loadingConfig.ts)
const searchResults = await apiWithInterceptor.get('/api/teachers/search?term=john');
const userInfo = await apiWithInterceptor.get('/api/auth/me');
const healthCheck = await apiWithInterceptor.get('/api/health');
```

### Manual Override
```typescript
// Force skip loading even for endpoints that normally show it
const data = await apiWithInterceptor.get('/api/teachers', {
  skipGlobalLoading: true
});

// Force loading even for endpoints that normally skip it
const searchResults = await apiWithInterceptor.get('/api/teachers/search', {
  skipGlobalLoading: false  // Override automatic skip
});
```

### Track Specific Operations
```typescript
// Track delete operation separately
await apiWithInterceptor.delete(`/api/teachers/${id}`, {
  operationId: 'delete-teacher'
});

// Use in component
const isDeletingTeacher = useSelector(selectIsOperationLoading('delete-teacher'));
```

### Service-Level Configuration
```typescript
// Temporarily disable loading for all teacher operations
teacherApiService.disableGlobalLoading();
const teachers = await teacherApiService.getAllTeachers(); // No loading
const teacher = await teacherApiService.getTeacherById('123'); // No loading

// Re-enable for future calls
teacherApiService.enableGlobalLoading();
```

### Dynamic Endpoint Configuration
```typescript
import { LoadingConfig } from '@/services/loadingConfig';

// Add custom endpoint to skip list at runtime
LoadingConfig.addSkipEndpoint('/api/my-background-task');

// Now this won't show loading
const result = await apiWithInterceptor.post('/api/my-background-task', data);

// Check what endpoints are configured to skip
const skipEndpoints = LoadingConfig.getSkipEndpoints();
console.log('Endpoints that skip loading:', skipEndpoints);
```

## Best Practices

1. **Trust the Automatic Configuration**: The system is preconfigured with smart defaults
2. **Use Manual Override Sparingly**: Only when the automatic behavior isn't right
3. **Skip for Real-time Features**: Search, autocomplete, polling (mostly automatic)
4. **Skip for Background Tasks**: Auto-save, analytics, non-user actions
5. **Use Operation IDs for Granular Control**: When you need specific UI feedback
6. **Configure at the Right Level**: 
   - Individual requests: Use `skipGlobalLoading` option
   - Multiple similar requests: Add to `loadingConfig.ts`
   - Entire service: Use service-level methods
   - Runtime changes: Use `LoadingConfig` API

## Gradual Migration

You can migrate service by service:

```typescript
export class TeacherApiService {
  private useInterceptor = true; // Toggle this flag
  
  private getApiService() {
    return this.useInterceptor ? apiWithInterceptor : apiService;
  }
  
  // Methods to control loading for entire service
  public disableGlobalLoading() {
    this.useInterceptor = false;
  }
  
  public enableGlobalLoading() {
    this.useInterceptor = true;
  }
  
  async getAllTeachers() {
    const api = this.getApiService();
    return api.get('/api/teachers');
  }
}
```

## Benefits

1. **Consistent UX**: Same loading experience across the app
2. **Less Boilerplate**: No manual loading state management
3. **Prevents Flicker**: Minimum duration ensures smooth experience
4. **Better Performance**: Centralized state management
5. **Easy to Maintain**: Single source of truth for loading

## What About Existing Loading States?

You can keep component-specific loading states for fine-grained control:
- Form submission feedback
- Button loading states
- Skeleton loaders
- Progress indicators

The global loader complements these, not replaces them.

## Troubleshooting

### Loading Stuck
Check if all requests are properly ending:
```typescript
const state = store.getState();
console.log('Active requests:', state.loading.activeRequests);
console.log('Operations:', state.loading.operations);
```

### Loading Not Showing
Ensure you're using `apiWithInterceptor`, not the old `apiService`. Check if the endpoint is in the skip list:
```typescript
import { LoadingConfig } from '@/services/loadingConfig';
const shouldSkip = LoadingConfig.shouldSkip('/api/your-endpoint', 'GET');
console.log('Endpoint skips loading:', shouldSkip);
```

### Too Many Loading Screens
1. Check if endpoint should be in automatic skip list (add to `loadingConfig.ts`)
2. Use `skipGlobalLoading` for individual requests
3. Disable at service level for related operations

### Endpoint Always Skipping Loading
Check the automatic configuration:
```typescript
import { LoadingConfig } from '@/services/loadingConfig';
const skipEndpoints = LoadingConfig.getSkipEndpoints();
console.log('Auto-skip endpoints:', skipEndpoints);

// Override automatic skip
const data = await apiWithInterceptor.get('/api/endpoint', {
  skipGlobalLoading: false
});
```

### Need Custom Loading Patterns
Add patterns to `loadingConfig.ts`:
```typescript
// In loadingConfig.ts, add to skipPatterns array
const skipPatterns = [
  /\/api\/your-custom-pattern/,
  // ... existing patterns
];
```

## Next Steps

1. Start with new features using the interceptor
2. Gradually migrate existing services
3. Remove unnecessary loading states from components
4. Enjoy cleaner code! 🎉
