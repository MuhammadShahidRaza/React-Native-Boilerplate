import { ENV_CONSTANTS } from 'constants/common';
import { getAppSettings } from 'api/functions/snlift/settings';
import type { AppSettings } from 'api/functions/snlift/settings';
import {
  setPlatformSettings,
  setPlatformSettingsLoading,
} from 'store/slices/platformSettings';
import store from 'store/store';
import type { AppDispatch } from 'types/reduxTypes';
import { parseJobDisplayTimer } from 'utils/jobDisplayTimer';
import { logger } from 'utils/logger';

let loadPromise: Promise<AppSettings | null> | null = null;

/** Load admin settings once per app session and cache in Redux. */
export function ensurePlatformSettingsLoaded(
  dispatch: AppDispatch = store.dispatch,
): Promise<AppSettings | null> {
  const { loaded, loading } = store.getState().platformSettings;
  if (loaded) {
    return Promise.resolve(store.getState().platformSettings.settings);
  }
  if (loading && loadPromise) {
    return loadPromise;
  }

  dispatch(setPlatformSettingsLoading(true));

  loadPromise = (async () => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      const mock: AppSettings = { job_display_timer: '00:02:00' };
      dispatch(setPlatformSettings(mock));
      return mock;
    }

    const settings = await getAppSettings();
    dispatch(setPlatformSettings(settings));
    return settings;
  })()
    .catch(error => {
      logger.error('ensurePlatformSettingsLoaded failed', error);
      const fallbackSeconds = parseJobDisplayTimer(undefined);
      dispatch(
        setPlatformSettings({
          job_display_timer: '00:02:00',
        }),
      );
      logger.log('[job timer] fallback settings →', fallbackSeconds, 'seconds');
      return store.getState().platformSettings.settings;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function selectJobDisplayTimerSeconds(state: {
  platformSettings: { jobDisplayTimerSeconds: number | null; loaded: boolean };
}): number | null {
  return state.platformSettings.jobDisplayTimerSeconds;
}
