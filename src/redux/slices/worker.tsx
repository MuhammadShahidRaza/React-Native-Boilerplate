import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WorkerAvailabilityState = {
  isOnline: boolean;
  isLookingForDeliveries: boolean;
  vehicleDetailsComplete: boolean;
  documentsComplete: boolean;
};

const initialState: WorkerAvailabilityState = {
  isOnline: false,
  isLookingForDeliveries: false,
  vehicleDetailsComplete: false,
  documentsComplete: false,
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
    setVehicleDetailsComplete(state, action: PayloadAction<boolean>) {
      state.vehicleDetailsComplete = action.payload;
    },
    setDocumentsComplete(state, action: PayloadAction<boolean>) {
      state.documentsComplete = action.payload;
    },
    resetWorkerAvailability() {
      return initialState;
    },
  },
});

export const {
  setWorkerOnline,
  setLookingForDeliveries,
  setVehicleDetailsComplete,
  setDocumentsComplete,
  resetWorkerAvailability,
} = workerSlice.actions;
export default workerSlice.reducer;
