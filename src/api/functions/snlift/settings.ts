import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest } from '../app';
import { ensurePlatformSettingsLoaded } from 'services/platformSettings';
import store from 'store/store';
import { parseJobDisplayTimer } from 'utils/jobDisplayTimer';
import { logger } from 'utils/logger';

export type AppSettings = {
  id?: number;
  job_display_timer?: string;
  job_display_radius_km?: string | number;
  [key: string]: unknown;
};

type SettingsResponse = {
  settings?: AppSettings;
};

function normalizeAppSettings(raw: Record<string, unknown>): AppSettings {
  const timer =
    raw.job_display_timer ??
    raw.job_display_timer_minutes ??
    raw.job_timer ??
    raw.jobTimer;
  return {
    ...(raw as AppSettings),
    ...(timer != null ? { job_display_timer: timer as string | number } : {}),
  };
}

function extractAppSettings(res: unknown): AppSettings | null {
  if (!res || typeof res !== 'object') return null;
  const record = res as Record<string, unknown>;

  if (record.settings && typeof record.settings === 'object') {
    return normalizeAppSettings(record.settings as Record<string, unknown>);
  }

  const data = record.data;
  if (data && typeof data === 'object') {
    const dataRecord = data as Record<string, unknown>;
    if (dataRecord.settings && typeof dataRecord.settings === 'object') {
      return normalizeAppSettings(dataRecord.settings as Record<string, unknown>);
    }
    if (
      'job_display_timer' in dataRecord ||
      'job_display_timer_minutes' in dataRecord
    ) {
      return normalizeAppSettings(dataRecord);
    }
  }

  if (
    'job_display_timer' in record ||
    'job_display_timer_minutes' in record
  ) {
    return normalizeAppSettings(record);
  }

  return null;
}

/** Direct API fetch — prefer ensurePlatformSettingsLoaded() for app usage. */
export async function getAppSettings(): Promise<AppSettings | null> {
  const res = await handleGetApiRequest<SettingsResponse>({
    url: API_ROUTES.GET_APP_SETTINGS,
    showLoader: false,
    showError: false,
    addToPending: true,
  });
  return extractAppSettings(res);
}

export async function getJobDisplayTimerSeconds(): Promise<number> {
  const cached = store.getState().platformSettings.jobDisplayTimerSeconds;
  if (store.getState().platformSettings.loaded && cached != null) {
    return cached;
  }

  await ensurePlatformSettingsLoaded();
  const seconds =
    store.getState().platformSettings.jobDisplayTimerSeconds ??
    parseJobDisplayTimer(undefined);
  logger.log('[job timer] cached settings →', seconds, 'seconds');
  return seconds;
}
