import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettingsState {
  isUserLoggedIn: boolean;
  isAppLoading: boolean;
  isUserVisitedApp: boolean;
  appLanguage: string;
  themeMode: 'light' | 'dark' | 'system'; // Add theme mode to redux
}

const initialState: AppSettingsState = {
  isUserLoggedIn: false,
  isAppLoading: false,
  isUserVisitedApp: false,
  appLanguage: 'en',
  themeMode: 'system',
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
    setThemeMode(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.themeMode = action.payload;
    },
    // Reset app state on logout
    resetAppState(state) {
      state.isUserLoggedIn = false;
      state.isAppLoading = false;
      // Keep language and theme preferences
    },
  },
});

export const {
  setIsUserLoggedIn,
  setIsUserVisitedApp,
  setIsAppLoading,
  setAppLanguage,
  setThemeMode,
  resetAppState,
} = appSlice.actions;
export default appSlice.reducer;
