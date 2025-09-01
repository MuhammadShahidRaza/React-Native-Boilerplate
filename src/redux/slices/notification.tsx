import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  status: string;
  isAllowed: boolean;
}

const initialState: NotificationState = {
  status: '',
  isAllowed: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setIsNotificationAllowed(state, action: PayloadAction<boolean>) {
      state.isAllowed = action.payload;
    },
  },
});

export const { setNotificationStatus, setIsNotificationAllowed } = notificationSlice.actions;
export default notificationSlice.reducer;
