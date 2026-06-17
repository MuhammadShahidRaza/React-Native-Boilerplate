import { useEffect, useMemo, useState } from 'react';
import { ENV_CONSTANTS } from 'constants/common';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import { mergeBookingWithTrackingProvider } from 'api/normalizers/snlift';
import type { SnliftBooking } from 'types/snliftApi';
import {
  buildMapRegion,
  resolveBookingDropoffCoord,
  resolveBookingPickupCoord,
} from 'utils/bookingCoords';
import { useBookingLiveTracking } from './useBookingLiveTracking';

type RouteCoords = {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
};

/** Booking detail + live tracking + resolved map coords (beta). */
export function useConsumerBookingTrack(
  bookingId: number | string | undefined,
  routeCoords?: RouteCoords,
  vehicleKind: 'car' | 'bike' = 'car',
) {
  const [booking, setBooking] = useState<SnliftBooking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(
    Boolean(bookingId) && !ENV_CONSTANTS.IS_ALPHA_PHASE,
  );

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE || !bookingId) {
      setBooking(null);
      setBookingLoading(false);
      return undefined;
    }

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
  }, [bookingId]);

  const live = useBookingLiveTracking(
    bookingId,
    Boolean(bookingId) && !ENV_CONSTANTS.IS_ALPHA_PHASE,
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

  const mapRegion = useMemo(
    () => (pickup && dropoff ? buildMapRegion(pickup, dropoff) : null),
    [pickup, dropoff],
  );

  const status = (live.status ?? booking?.status ?? '').toLowerCase();

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
    providerCoord: live.providerCoord,
    providerBearing: live.providerBearing,
    pickup,
    dropoff,
    mapRegion,
  };
}
