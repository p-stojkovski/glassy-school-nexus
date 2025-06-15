
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '@/types/enums';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: {
    id: '1',
    name: 'Nikolina Pejkovska',
    email: 'nikolina@thinkenglish.com',
    role: UserRole.Admin,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikolina',
  },
  isAuthenticated: true,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
