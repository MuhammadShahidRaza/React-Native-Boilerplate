import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'types/responseTypes';

export interface UserState {
  userDetails: User | null;
  userVideos: Array<object> | null;
  openGuestModal: boolean;
}

const initialState: UserState = {
  userDetails: null,
  userVideos: null,
  openGuestModal: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<User | null>) {
      state.userDetails = action.payload;
    },
    setUserVideos(state, action: PayloadAction<Array<object> | null>) {
      state.userVideos = action.payload;
    },
    setGuestModal(state, action: PayloadAction<boolean>) {
      state.openGuestModal = action.payload;
    },
  },
});

export const { setGuestModal, setUserDetails, setUserVideos } = userSlice.actions;
export default userSlice.reducer;
