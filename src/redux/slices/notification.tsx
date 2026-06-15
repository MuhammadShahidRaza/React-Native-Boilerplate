import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  status: string;
  isAllowed: boolean;
  newInquiriesUnreadCount: number;
}

const initialState: NotificationState = {
  status: '',
  isAllowed: false,
  newInquiriesUnreadCount: 0,
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
    incrementNewInquiriesUnreadCount(state) {
      state.newInquiriesUnreadCount += 1;
    },
    resetNewInquiriesUnreadCount(state) {
      state.newInquiriesUnreadCount = 0;
    },
    resetNotificationState() {
      return initialState;
    },
  },
});

export const {
  setNotificationStatus,
  setIsNotificationAllowed,
  incrementNewInquiriesUnreadCount,
  resetNewInquiriesUnreadCount,
  resetNotificationState,
} = notificationSlice.actions;
export default notificationSlice.reducer;
