import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from 'api/functions/snlift/settings';
import { parseJobDisplayTimer } from 'utils/jobDisplayTimer';

export type PlatformSettingsState = {
  settings: AppSettings | null;
  jobDisplayTimerSeconds: number | null;
  loaded: boolean;
  loading: boolean;
};

const initialState: PlatformSettingsState = {
  settings: null,
  jobDisplayTimerSeconds: null,
  loaded: false,
  loading: false,
};

const platformSettingsSlice = createSlice({
  name: 'platformSettings',
  initialState,
  reducers: {
    setPlatformSettingsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPlatformSettings(state, action: PayloadAction<AppSettings | null>) {
      state.settings = action.payload;
      state.jobDisplayTimerSeconds = parseJobDisplayTimer(
        action.payload?.job_display_timer ??
          (action.payload as { job_display_timer_minutes?: string | number } | null)
            ?.job_display_timer_minutes,
      );
      state.loaded = true;
      state.loading = false;
    },
  },
});

export const { setPlatformSettings, setPlatformSettingsLoading } =
  platformSettingsSlice.actions;
export default platformSettingsSlice.reducer;
