import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  // Track active requests count
  activeRequests: number;
  // Track specific operation loading states (optional)
  operations: Record<string, boolean>;
  // Global loading overlay visibility
  showGlobalLoader: boolean;
  // Minimum duration to show loader (prevents flickering)
  minDuration: number;
  // Delay before showing loader (prevents flicker for fast requests)
  showDelay: number;
  // Internal state to track if we should show loader after delay
  shouldShowAfterDelay: boolean;
}

const initialState: LoadingState = {
  activeRequests: 0,
  operations: {},
  showGlobalLoader: false,
  minDuration: 300, // milliseconds
  showDelay: 300, // milliseconds - delay before showing loader
  shouldShowAfterDelay: false,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startRequest: (state, action: PayloadAction<{ operationId?: string }>) => {
      state.activeRequests += 1;
      
      if (action.payload.operationId) {
        state.operations[action.payload.operationId] = true;
      }
      
      // Mark that we should potentially show loader after delay
      if (state.activeRequests > 0) {
        state.shouldShowAfterDelay = true;
      }
    },
    
    endRequest: (state, action: PayloadAction<{ operationId?: string }>) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      
      if (action.payload.operationId) {
        delete state.operations[action.payload.operationId];
      }
      
      // Hide global loader if no active requests
      if (state.activeRequests === 0) {
        state.showGlobalLoader = false;
        state.shouldShowAfterDelay = false;
      }
    },
    
    // New action to show loader after delay has passed
    showLoaderAfterDelay: (state) => {
      // Only show if we still have active requests and should show after delay
      if (state.activeRequests > 0 && state.shouldShowAfterDelay) {
        state.showGlobalLoader = true;
      }
    },
    
    setOperationLoading: (
      state,
      action: PayloadAction<{ operationId: string; isLoading: boolean }>
    ) => {
      if (action.payload.isLoading) {
        state.operations[action.payload.operationId] = true;
      } else {
        delete state.operations[action.payload.operationId];
      }
    },
    
    resetLoading: (state) => {
      state.activeRequests = 0;
      state.operations = {};
      state.showGlobalLoader = false;
    },
    
    setMinDuration: (state, action: PayloadAction<number>) => {
      state.minDuration = action.payload;
    },
    
    setShowDelay: (state, action: PayloadAction<number>) => {
      state.showDelay = action.payload;
    },
  },
});

export const {
  startRequest,
  endRequest,
  showLoaderAfterDelay,
  setOperationLoading,
  resetLoading,
  setMinDuration,
  setShowDelay,
} = loadingSlice.actions;

export default loadingSlice.reducer;

// Selectors
export const selectIsGlobalLoading = (state: { loading: LoadingState }) =>
  state.loading.showGlobalLoader;

export const selectIsOperationLoading = (operationId: string) => 
  (state: { loading: LoadingState }) => state.loading.operations[operationId] || false;

export const selectActiveRequestsCount = (state: { loading: LoadingState }) =>
  state.loading.activeRequests;
