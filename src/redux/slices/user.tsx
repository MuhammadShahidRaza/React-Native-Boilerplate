import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserAddress } from 'types/responseTypes';
import type { USER_TYPE } from 'types/auth';
import { APP_CONFIG } from 'config/app';

export interface UserState {
  userDetails: User | null;
  openGuestModal: boolean;
  role: USER_TYPE;
}

/** Map API `user_type` / `user_role` into app role (legacy `dentor` → courier). */
function normalizeApiRoleToAppRole(raw: string | undefined): USER_TYPE {
  if (raw === APP_CONFIG.DRIVER_ROLE) return APP_CONFIG.DRIVER_ROLE;
  if (raw === APP_CONFIG.COURIER_ROLE) {
    return APP_CONFIG.COURIER_ROLE;
  }
  return APP_CONFIG.USER_ROLE;
}

const initialState: UserState = {
  userDetails: null,
  openGuestModal: false,
  role: APP_CONFIG.USER_ROLE,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<User | null>) {
      state.userDetails = action.payload;
      if (action.payload) {
        const raw = action.payload.user_type ?? action.payload.user_role;
        state.role = normalizeApiRoleToAppRole(raw);
      }
    },
    setUserAddressDefault(state, action: PayloadAction<UserAddress>) {
      state.userDetails = state.userDetails
        ? {
            ...state.userDetails,
            address: {
              ...action.payload,
              is_default: 1,
            },
          }
        : null;
    },
    setNotificationUnreadCount(state, action: PayloadAction<number | undefined>) {
      state.userDetails = state.userDetails
        ? {
            ...state.userDetails,
            notification_unread_count: action.payload ?? 0,
          }
        : null;
    },
    setRole(state, action: PayloadAction<USER_TYPE>) {
      state.role = action.payload;
      state.userDetails = state.userDetails
        ? {
            ...state.userDetails,
            user_type: action.payload,
          }
        : null;
    },
    setGuestModal(state, action: PayloadAction<boolean>) {
      state.openGuestModal = action.payload;
    },
    resetUserState() {
      return initialState;
    },
  },
});

export const {
  setGuestModal,
  setUserDetails,
  setRole,
  resetUserState,
  setUserAddressDefault,
  setNotificationUnreadCount,
} = userSlice.actions;
export default userSlice.reducer;
