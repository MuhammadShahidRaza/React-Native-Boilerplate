import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface PaymentState {
  isPaymentlater: boolean;
}

const initialState: PaymentState = {
  isPaymentlater: true,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setIsPaymentLater(state, action: PayloadAction<boolean>) {
      state.isPaymentlater = action.payload;
    },
  },
});

export const {setIsPaymentLater} = paymentSlice.actions;
export default paymentSlice.reducer;
