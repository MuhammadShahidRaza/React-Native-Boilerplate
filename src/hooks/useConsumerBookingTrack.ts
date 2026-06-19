import { useEffect, useMemo, useState } from 'react';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaBookingById } from 'constants/alphaBookingMocks';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import { mergeBookingWithTrackingProvider } from 'api/normalizers/snlift';
import type { SnliftBooking } from 'types/snliftApi';
import {
  buildMapRegion,
  resolveBookingDropoffCoord,
  resolveBookingPickupCoord,
} from 'utils/bookingCoords';
import {
  resolveAlphaProviderBearing,
  resolveAlphaProviderCoord,
} from 'utils/alphaProviderLocation';
import { useBookingLiveTracking } from './useBookingLiveTracking';

type RouteCoords = {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
};

type ConsumerBookingTrackOptions = {
  /** Alpha-only: override booking status when UI phase differs from stored booking. */
  alphaStatusOverride?: string;
};

/** Booking detail + live tracking + resolved map coords. */
export function useConsumerBookingTrack(
  bookingId: number | string | undefined,
  routeCoords?: RouteCoords,
  vehicleKind: 'car' | 'bike' = 'car',
  options?: ConsumerBookingTrackOptions,
) {
  const isAlpha = ENV_CONSTANTS.IS_ALPHA_PHASE;
  const [booking, setBooking] = useState<SnliftBooking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(Boolean(bookingId) && !isAlpha);

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      setBookingLoading(false);
      return undefined;
    }

    if (!isAlpha) {
      let cancelled = false;
      setBookingLoading(true);

      (async () => {
        const res = await getBookingById(bookingId, 'user', {
          showLoader: false,
          showError: false,
          silentErrors: true,
        });
        if (cancelled) return;
        setBooking(extractBookingFromResponse(res));
        setBookingLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    const refresh = () => {
      const next = getAlphaBookingById(bookingId) ?? null;
      if (!cancelled) {
        setBooking(next);
        setBookingLoading(false);
      }
    };

    refresh();
    const intervalId = setInterval(refresh, isAlpha ? 500 : 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [bookingId, isAlpha]);

  const live = useBookingLiveTracking(
    bookingId,
    Boolean(bookingId) && !isAlpha,
    vehicleKind,
    booking?.provider_id,
  );

  const pickup = useMemo(
    () =>
      resolveBookingPickupCoord({
        tracking: live.tracking?.pickup ?? null,
        booking,
        routeLat: routeCoords?.pickupLat,
        routeLng: routeCoords?.pickupLng,
      }),
    [live.tracking?.pickup, booking, routeCoords?.pickupLat, routeCoords?.pickupLng],
  );

  const dropoff = useMemo(
    () =>
      resolveBookingDropoffCoord({
        tracking: live.tracking?.dropoff ?? null,
        booking,
        routeLat: routeCoords?.dropoffLat,
        routeLng: routeCoords?.dropoffLng,
      }),
    [live.tracking?.dropoff, booking, routeCoords?.dropoffLat, routeCoords?.dropoffLng],
  );

  const alphaProviderCoord = useMemo(() => {
    if (!isAlpha || !booking || !pickup || !dropoff) return null;
    return resolveAlphaProviderCoord(
      booking,
      pickup,
      dropoff,
      options?.alphaStatusOverride,
    );
  }, [booking, dropoff, isAlpha, options?.alphaStatusOverride, pickup]);

  const alphaProviderBearing = useMemo(() => {
    if (!isAlpha || !booking || !pickup || !dropoff || !alphaProviderCoord) return 0;
    return resolveAlphaProviderBearing(
      booking,
      pickup,
      dropoff,
      alphaProviderCoord,
      vehicleKind,
      options?.alphaStatusOverride,
    );
  }, [
    alphaProviderCoord,
    booking,
    dropoff,
    isAlpha,
    options?.alphaStatusOverride,
    pickup,
    vehicleKind,
  ]);

  const mapRegion = useMemo(
    () => (pickup && dropoff ? buildMapRegion(pickup, dropoff) : null),
    [pickup, dropoff],
  );

  const status = (options?.alphaStatusOverride ?? live.status ?? booking?.status ?? '').toLowerCase();

  const mergedBooking = useMemo(
    () =>
      mergeBookingWithTrackingProvider(
        booking,
        live.tracking?.provider ?? null,
        live.tracking?.provider_id,
      ),
    [booking, live.tracking?.provider, live.tracking?.provider_id],
  );

  return {
    booking: mergedBooking,
    bookingLoading,
    tracking: live.tracking,
    status,
    providerCoord: isAlpha ? alphaProviderCoord : live.providerCoord,
    providerBearing: isAlpha ? alphaProviderBearing : live.providerBearing,
    pickup,
    dropoff,
    mapRegion,
  };
}
