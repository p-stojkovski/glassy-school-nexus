import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '@/types/enums';
import authService, { LoginCredentials, User } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
  logoutAllLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  loginLoading: false,
  logoutLoading: false,
  logoutAllLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutFromAllDevicesAsync = createAsyncThunk(
  'auth/logoutFromAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutFromAllDevices();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout from all devices failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current user';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Legacy actions for backward compatibility
    loginStart: (state) => {
      state.loginLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loginLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loginLoading = false;
      state.error = action.payload;
    },
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loginLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loginLoading = false;
      state.logoutLoading = false;
      state.logoutAllLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loginLoading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loginLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.logoutLoading = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        // Even if logout API fails, clear the local state
        state.user = null;
        state.isAuthenticated = false;
        state.logoutLoading = false;
        state.error = action.payload as string;
      });

    // Logout from all devices
    builder
      .addCase(logoutFromAllDevicesAsync.pending, (state) => {
        state.logoutAllLoading = true;
        state.error = null;
      })
      .addCase(logoutFromAllDevicesAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.logoutAllLoading = false;
        state.error = null;
      })
      .addCase(logoutFromAllDevicesAsync.rejected, (state, action) => {
        // Even if logout from all devices API fails, clear the local state
        state.user = null;
        state.isAuthenticated = false;
        state.logoutAllLoading = false;
        state.error = action.payload as string;
      });

    // Get current user
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setUser,
  loginStart,
  loginSuccess,
  loginFailure,
  login,
  logout,
  setLoading,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectLoginLoading = (state: { auth: AuthState }) => state.auth.loginLoading;
export const selectLogoutLoading = (state: { auth: AuthState }) => state.auth.logoutLoading;
export const selectLogoutAllLoading = (state: { auth: AuthState }) => state.auth.logoutAllLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Helper selector for full name (backward compatibility)
export const selectUserFullName = (state: { auth: AuthState }) => {
  const user = state.auth.user;
  return user ? `${user.firstName} ${user.lastName}`.trim() : '';
};

export default authSlice.reducer;

