import { useEffect, useRef, useState } from 'react';
import { ENV_CONSTANTS } from 'constants/common';
import {
  getBookingTracking,
  type SnliftBookingTracking,
} from 'api/functions/snlift/bookings';
import {
  bearingBetweenCoords,
  mapCoordDistanceApprox,
  type MapCoord,
} from 'utils/coordinateAlongPolyline';
import { getVehicleMarkerHeading } from 'hooks/useWorkerGpsNavigation';
import { useProviderFirestoreLocation } from './useProviderFirestoreLocation';
import { subscribeBookingUpdate } from 'utils/bookingUpdateSignal';

const DEFAULT_POLL_MS = 15000;
const FIRESTORE_STATUS_POLL_MS = 45000;
const MIN_POLL_MS = 15000;
const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

function parseProviderLocation(
  loc: SnliftBookingTracking['provider_location'],
): MapCoord | null {
  if (!loc) return null;
  const lat =
    typeof loc.latitude === 'number'
      ? loc.latitude
      : parseFloat(String(loc.latitude ?? ''));
  const lng =
    typeof loc.longitude === 'number'
      ? loc.longitude
      : parseFloat(String(loc.longitude ?? ''));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { latitude: lat, longitude: lng };
}

/** Poll booking tracking API + Firestore for live provider position (beta only). */
export function useBookingLiveTracking(
  bookingId: number | string | undefined,
  enabled = true,
  vehicleKind: 'car' | 'bike' = 'car',
  fallbackProviderId?: number | string | null,
) {
  const [tracking, setTracking] = useState<SnliftBookingTracking | null>(null);
  const [apiCoord, setApiCoord] = useState<MapCoord | null>(null);
  const [apiBearing, setApiBearing] = useState(0);
  const prevApiRef = useRef<MapCoord | null>(null);
  const fallbackProviderIdRef = useRef(fallbackProviderId);
  const firestoreActiveRef = useRef(false);

  useEffect(() => {
    fallbackProviderIdRef.current = fallbackProviderId;
  }, [fallbackProviderId]);

  const liveEnabled = enabled && !ENV_CONSTANTS.IS_ALPHA_PHASE && Boolean(bookingId);
  const providerId = tracking?.provider_id ?? fallbackProviderIdRef.current ?? null;

  const { coord: firestoreCoord, bearing: firestoreBearing } = useProviderFirestoreLocation(
    providerId,
    liveEnabled && providerId != null,
    vehicleKind,
  );

  firestoreActiveRef.current = firestoreCoord != null;

  useEffect(() => {
    if (!liveEnabled || !bookingId) {
      setTracking(null);
      setApiCoord(null);
      prevApiRef.current = null;
      return undefined;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const schedule = (delayMs: number) => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void tick();
      }, delayMs);
    };

    const tick = async () => {
      if (cancelled) return;

      const result = await getBookingTracking(bookingId, 'user', {
        showLoader: false,
        showError: false,
        silentErrors: true,
      });

      if (cancelled) return;

      if (result) {
        setTracking(result);

        const next = parseProviderLocation(result.provider_location);
        if (next && !firestoreActiveRef.current) {
          const prev = prevApiRef.current;
          if (prev && mapCoordDistanceApprox(prev, next) > 0.000012) {
            setApiBearing(
              getVehicleMarkerHeading(bearingBetweenCoords(prev, next), vehicleKind),
            );
          }
          prevApiRef.current = next;
          setApiCoord(next);
        }

        const status = (result.status ?? '').toLowerCase();
        if (TERMINAL_STATUSES.has(status)) return;

        const pollSec = Number(result.poll_after_seconds);
        const apiDelayMs =
          Number.isFinite(pollSec) && pollSec > 0 ? pollSec * 1000 : DEFAULT_POLL_MS;
        const delayMs = Math.max(
          MIN_POLL_MS,
          firestoreActiveRef.current ? FIRESTORE_STATUS_POLL_MS : apiDelayMs,
        );
        schedule(delayMs);
        return;
      }

      schedule(firestoreActiveRef.current ? FIRESTORE_STATUS_POLL_MS : DEFAULT_POLL_MS);
    };

    void tick();

    // A push notification about this booking arrived — poll now instead of waiting for the next tick.
    const unsubscribe = subscribeBookingUpdate(updatedBookingId => {
      if (String(updatedBookingId) !== String(bookingId)) return;
      void tick();
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [bookingId, liveEnabled, vehicleKind]);

  const providerCoord = firestoreCoord ?? apiCoord;
  const providerBearing = firestoreCoord ? firestoreBearing : apiBearing;

  return {
    tracking,
    status: tracking?.status,
    providerCoord,
    providerBearing,
    pickup: tracking?.pickup,
    dropoff: tracking?.dropoff,
    provider: tracking?.provider,
  };
}
