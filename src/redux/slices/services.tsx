import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service } from 'types/responseTypes';

export interface ServiceType {
  id: number;
  service_id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServicesState {
  services: Service[];
}

const initialState: ServicesState = {
  services: [],
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices(state, action: PayloadAction<Service[]>) {
      state.services = action.payload;
    },
    resetServicesState() {
      return initialState;
    },
  },
});

export const { setServices, resetServicesState } = servicesSlice.actions;
export default servicesSlice.reducer;
