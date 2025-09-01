import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AddressState {
  addressList: string[]; // Assuming addressList is an array of strings
}

const initialState: AddressState = {
  addressList: [],
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setUserAddressList(state, action: PayloadAction<string[]>) {
      state.addressList = action.payload;
    },
  },
});

export const { setUserAddressList } = addressSlice.actions;
export default addressSlice.reducer;
