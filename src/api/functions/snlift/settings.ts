import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest } from '../app';
import { parseJobDisplayTimer } from 'utils/jobDisplayTimer';

export type AppSettings = {
  id?: number;
  job_display_timer?: string;
  job_display_radius_km?: string | number;
  [key: string]: unknown;
};

type SettingsResponse = {
  settings?: AppSettings;
};

function extractAppSettings(res: unknown): AppSettings | null {
  if (!res || typeof res !== 'object') return null;
  const record = res as Record<string, unknown>;
  if (record.settings && typeof record.settings === 'object') {
    return record.settings as AppSettings;
  }
  if ('job_display_timer' in record) {
    return record as AppSettings;
  }
  return null;
}

let cachedSettings: AppSettings | null = null;
let settingsPromise: Promise<AppSettings | null> | null = null;

export async function getAppSettings(forceRefresh = false): Promise<AppSettings | null> {
  if (!forceRefresh && cachedSettings) return cachedSettings;
  if (!forceRefresh && settingsPromise) return settingsPromise;

  settingsPromise = (async () => {
    const res = await handleGetApiRequest<SettingsResponse>({
      url: API_ROUTES.GET_APP_SETTINGS,
      showLoader: false,
      showError: false,
      addToPending: true,
    });
    const settings = extractAppSettings(res);
    if (!settings) return null;
    cachedSettings = settings;
    return cachedSettings;
  })();

  try {
    return await settingsPromise;
  } finally {
    settingsPromise = null;
  }
}

export function clearAppSettingsCache(): void {
  cachedSettings = null;
  settingsPromise = null;
}

export async function getJobDisplayTimerSeconds(): Promise<number> {
  const settings = await getAppSettings();
  return parseJobDisplayTimer(settings?.job_display_timer);
}
