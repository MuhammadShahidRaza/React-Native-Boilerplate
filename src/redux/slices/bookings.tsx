import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from 'types/responseTypes';

export type BookingsTab = 'user' | 'dentor';

export interface BookingsTabState {
  items: Booking[];
  currentPage: number;
  lastPage: number;
  total: number;
  /** True after at least one successful fetch (so we can "return cache" on next mount) */
  loaded: boolean;
}

export interface BookingsState {
  user: BookingsTabState;
  dentor: BookingsTabState;
}

const initialTab: BookingsTabState = {
  items: [],
  currentPage: 0,
  lastPage: 0,
  total: 0,
  loaded: false,
};

const initialState: BookingsState = {
  user: { ...initialTab },
  dentor: { ...initialTab },
};

type SetBookingsPayload = {
  tab: BookingsTab;
  items: Booking[];
  currentPage: number;
  lastPage: number;
  total: number;
};

type AppendBookingsPayload = {
  tab: BookingsTab;
  items: Booking[];
  currentPage: number;
  lastPage: number;
  total: number;
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<SetBookingsPayload>) {
      const { tab, items, currentPage, lastPage, total } = action.payload;
      state[tab] = {
        items,
        currentPage,
        lastPage,
        total,
        loaded: true,
      };
    },
    appendBookings(state, action: PayloadAction<AppendBookingsPayload>) {
      const { tab, items, currentPage, lastPage, total } = action.payload;
      const prev = state[tab];
      state[tab] = {
        items: prev.items.concat(items),
        currentPage,
        lastPage,
        total,
        loaded: true,
      };
    },
    clearBookings(state, action: PayloadAction<BookingsTab>) {
      state[action.payload] = { ...initialTab };
    },
    resetBookingsState() {
      return initialState;
    },
  },
});

export const { setBookings, appendBookings, clearBookings, resetBookingsState } =
  bookingsSlice.actions;
export default bookingsSlice.reducer;
