import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettingsState {
  isUserLoggedIn: boolean;
  isAppLoading: boolean;
  isUserVisitedApp: boolean;
  appLanguage: string;
}

const initialState: AppSettingsState = {
  isUserLoggedIn: false,
  isAppLoading: false,
  isUserVisitedApp: false,
  appLanguage: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsUserLoggedIn(state, action: PayloadAction<boolean>) {
      state.isUserLoggedIn = action.payload;
    },
    setIsUserVisitedApp(state, action: PayloadAction<boolean>) {
      state.isUserVisitedApp = action.payload;
    },
    setIsAppLoading(state, action: PayloadAction<boolean>) {
      state.isAppLoading = action.payload;
    },
    setAppLanguage(state, action: PayloadAction<string>) {
      state.appLanguage = action.payload;
    },
  },
});

export const { setIsUserLoggedIn, setIsUserVisitedApp, setIsAppLoading, setAppLanguage } =
  appSlice.actions;
export default appSlice.reducer;
