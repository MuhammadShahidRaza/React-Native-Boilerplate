import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FoodCartItem = {
  id: string;
  menuItemId: number;
  title: string;
  price: number;
  qty: number;
  imageUri?: string | null;
};

export type FoodCartState = {
  restaurantId: string | null;
  restaurantName: string;
  restaurantDistanceKm?: number;
  items: FoodCartItem[];
};

const initialState: FoodCartState = {
  restaurantId: null,
  restaurantName: '',
  items: [],
};

const foodCartSlice = createSlice({
  name: 'foodCart',
  initialState,
  reducers: {
    setCartRestaurant(
      state,
      action: PayloadAction<{
        restaurantId: string;
        restaurantName: string;
        restaurantDistanceKm?: number;
      }>,
    ) {
      state.restaurantId = action.payload.restaurantId;
      state.restaurantName = action.payload.restaurantName;
      state.restaurantDistanceKm = action.payload.restaurantDistanceKm;
      state.items = [];
    },
    upsertItem(state, action: PayloadAction<Omit<FoodCartItem, 'qty'>>) {
      const { id } = action.payload;
      const existing = state.items.find(i => i.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    decrementItem(state, action: PayloadAction<string>) {
      const idx = state.items.findIndex(i => i.id === action.payload);
      if (idx === -1) return;
      if (state.items[idx].qty <= 1) {
        state.items.splice(idx, 1);
      } else {
        state.items[idx].qty -= 1;
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    clearCart(state) {
      state.restaurantId = null;
      state.restaurantName = '';
      state.restaurantDistanceKm = undefined;
      state.items = [];
    },
    resetFoodCartState() {
      return initialState;
    },
  },
});

export const { setCartRestaurant, upsertItem, decrementItem, removeItem, clearCart, resetFoodCartState } =
  foodCartSlice.actions;
export default foodCartSlice.reducer;
