import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from 'types/responseTypes';
import type { AddressDetails } from 'utils/location';

export interface AddressState {
  addressList: Address[];
  currentAddress: AddressDetails | null;
}

const initialState: AddressState = {
  addressList: [],
  currentAddress: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setAddressList(state, action: PayloadAction<Address[]>) {
      state.addressList = action.payload;
    },
    appendAddressList(state, action: PayloadAction<Address[]>) {
      state.addressList.push(...action.payload);
    },
    addAddress(state, action: PayloadAction<Address>) {
      const exists = state.addressList.some(a => a.id === action.payload.id);
      if (!exists) state.addressList.unshift(action.payload);
    },
    updateAddressInList(state, action: PayloadAction<Address>) {
      const idx = state.addressList.findIndex(a => a.id === action.payload.id);
      if (idx >= 0) state.addressList[idx] = action.payload;
    },
    removeAddress(state, action: PayloadAction<number>) {
      state.addressList = state.addressList.filter(a => a.id !== action.payload);
    },
    setAddressDefault(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.addressList.forEach(addr => {
        addr.is_default = addr.id === id ? 1 : 0;
      });
    },
    setCurrentAddress(state, action: PayloadAction<AddressDetails | null>) {
      state.currentAddress = action.payload;
    },
    resetAddressState() {
      return initialState;
    },
  },
});

export const {
  setAddressList,
  appendAddressList,
  addAddress,
  updateAddressInList,
  removeAddress,
  setAddressDefault,
  setCurrentAddress,
  resetAddressState,
} = addressSlice.actions;
export default addressSlice.reducer;
