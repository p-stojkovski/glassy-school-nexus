import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme, NotificationType } from '@/types/enums';

interface UIState {
  sidebarCollapsed: boolean;
  theme: Theme;
  notifications: Array<{
    id: string;
    type: NotificationType;
    message: string;
    timestamp: number;
  }>;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: Theme.Light,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UIState['notifications'][0], 'id' | 'timestamp'>
      >
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const { toggleSidebar, setTheme, addNotification, removeNotification } =
  uiSlice.actions;
export default uiSlice.reducer;
