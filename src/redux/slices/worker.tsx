import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WorkerAvailabilityState = {
  isOnline: boolean;
  isLookingForDeliveries: boolean;
};

const initialState: WorkerAvailabilityState = {
  isOnline: false,
  isLookingForDeliveries: false,
};

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    setWorkerOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.isLookingForDeliveries = false;
      }
    },
    setLookingForDeliveries(state, action: PayloadAction<boolean>) {
      state.isLookingForDeliveries = action.payload;
      if (action.payload) {
        state.isOnline = true;
      }
    },
    resetWorkerAvailability() {
      return initialState;
    },
  },
});

export const { setWorkerOnline, setLookingForDeliveries, resetWorkerAvailability } =
  workerSlice.actions;
export default workerSlice.reducer;
