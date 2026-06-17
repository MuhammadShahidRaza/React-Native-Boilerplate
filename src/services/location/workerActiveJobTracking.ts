import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import notifee, { AndroidForegroundServiceType, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { updateWorkerFirestoreLocation } from './workerLocation';
import { isIOS } from 'utils/helpers';
import { logger } from 'utils/logger';

const STORAGE_KEY = 'worker_active_job_tracking_v1';
const TRACKING_NOTIFICATION_ID = 'worker-active-job-tracking';
const TRACKING_CHANNEL_ID = 'worker-location-tracking';

export type ActiveJobTrackingState = {
  userId: string;
  role: string;
  bookingId: string;
};

let watchId: number | null = null;
let foregroundTaskResolve: (() => void) | null = null;
let isTracking = false;

async function readStoredState(): Promise<ActiveJobTrackingState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveJobTrackingState;
    if (!parsed?.userId || !parsed?.bookingId || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeStoredState(state: ActiveJobTrackingState | null): Promise<void> {
  if (!state) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function ensureBackgroundLocationPermission(): Promise<boolean> {
  try {
    if (isIOS()) {
      const always = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      if (always === RESULTS.GRANTED) return true;

      const whenInUse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (whenInUse !== RESULTS.GRANTED) {
        const requested = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (requested !== RESULTS.GRANTED) return false;
      }

      const requestedAlways = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      return requestedAlways === RESULTS.GRANTED;
    }

    const fine = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (fine !== RESULTS.GRANTED) {
      const requestedFine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (requestedFine !== RESULTS.GRANTED) return false;
    }

    if (Number(Platform.Version) >= 29) {
      const background = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      if (background !== RESULTS.GRANTED) {
        const requestedBg = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        return requestedBg === RESULTS.GRANTED;
      }
    }

    return true;
  } catch (error) {
    logger.error('ensureBackgroundLocationPermission error:', error);
    return false;
  }
}

function clearLocationWatch(): void {
  if (watchId != null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function startLocationWatch(state: ActiveJobTrackingState): void {
  clearLocationWatch();
  watchId = Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      void updateWorkerFirestoreLocation(
        state.userId,
        latitude,
        longitude,
        state.role,
        state.bookingId,
      );
    },
    error => {
      logger.error('workerActiveJobTracking watch error:', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 15,
      interval: 8000,
      fastestInterval: 5000,
      useSignificantChanges: false,
      ...(isIOS()
        ? {
            showsBackgroundLocationIndicator: true,
          }
        : {}),
    },
  );
}

async function startAndroidForegroundNotification(): Promise<void> {
  await notifee.createChannel({
    id: TRACKING_CHANNEL_ID,
    name: 'Active job location',
    importance: AndroidImportance.LOW,
  });

  await notifee.displayNotification({
    id: TRACKING_NOTIFICATION_ID,
    title: 'SN Lift',
    body: 'Sharing your location for an active job',
    android: {
      channelId: TRACKING_CHANNEL_ID,
      asForegroundService: true,
      foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_LOCATION],
      ongoing: true,
      pressAction: { id: 'default' },
    },
  });
}

/** Android Notifee foreground-service runner — registered in index.js. */
export function runWorkerTrackingForegroundTask(): Promise<void> {
  return new Promise(resolve => {
    foregroundTaskResolve = resolve;
    void (async () => {
      const state = await readStoredState();
      if (state) {
        startLocationWatch(state);
      }
    })();
  });
}

export async function startWorkerActiveJobTracking(
  params: ActiveJobTrackingState,
): Promise<void> {
  if (isTracking) {
    await stopWorkerActiveJobTracking();
  }

  const permitted = await ensureBackgroundLocationPermission();
  if (!permitted) {
    logger.log('workerActiveJobTracking: background location not granted, using best effort');
  }

  await writeStoredState(params);
  isTracking = true;

  if (isIOS()) {
    startLocationWatch(params);
    return;
  }

  try {
    await startAndroidForegroundNotification();
  } catch (error) {
    logger.error('workerActiveJobTracking: foreground service failed, using in-app GPS', error);
    startLocationWatch(params);
  }
}

export async function ensureWorkerActiveJobTracking(
  params: ActiveJobTrackingState,
): Promise<void> {
  const stored = await readStoredState();
  if (isTracking && stored?.bookingId === params.bookingId) return;
  await startWorkerActiveJobTracking(params);
}

export async function stopWorkerActiveJobTracking(): Promise<void> {
  isTracking = false;
  clearLocationWatch();
  await writeStoredState(null);

  if (!isIOS()) {
    try {
      await notifee.stopForegroundService();
      await notifee.cancelNotification(TRACKING_NOTIFICATION_ID);
    } catch (error) {
      logger.error('stopWorkerActiveJobTracking notifee error:', error);
    }
  }

  foregroundTaskResolve?.();
  foregroundTaskResolve = null;
}

/** Resume tracking after app restart when an active job was persisted. */
export async function resumeWorkerActiveJobTrackingIfNeeded(): Promise<void> {
  const state = await readStoredState();
  if (!state || isTracking) return;
  await startWorkerActiveJobTracking(state);
}

export function isWorkerActiveJobTracking(): boolean {
  return isTracking;
}
