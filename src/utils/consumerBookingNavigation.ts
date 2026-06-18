import { SCREENS } from 'constants/routes';
import type { SnliftBooking } from 'types/snliftApi';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';

import { parseMapCoord } from 'utils/bookingCoords';
import { isTerminalBookingStatus, mapFoodOrderPhase } from 'utils/bookingTrackPhases';

function bookingCoords(booking: SnliftBooking) {
  const pickupLat = parseMapCoord(booking.pickup_latitude, booking.pickup_longitude)?.latitude;
  const pickupLng = parseMapCoord(booking.pickup_latitude, booking.pickup_longitude)?.longitude;
  const dropoffLat = parseMapCoord(booking.dropoff_latitude, booking.dropoff_longitude)?.latitude;
  const dropoffLng = parseMapCoord(booking.dropoff_latitude, booking.dropoff_longitude)?.longitude;
  return {
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    bookingId: booking.id,
  };
}

export function buildConsumerBookingTrackTarget(booking: SnliftBooking): {
  screen: string;
  params: Record<string, unknown>;
} | null {
  const status = (booking.status ?? 'pending').toLowerCase();
  const type = booking.booking_type ?? 'ride';
  const coords = bookingCoords(booking);

  if (type === 'ride') {
    if (status === 'pending') {
      return {
        screen: SCREENS.FINDING_DRIVER,
        params: {
          ...coords,
          pickupAddress: booking.pickup_address,
          dropoffAddress: booking.dropoff_address,
          createdAt: booking.created_at ?? undefined,
        },
      };
    }
    if (status === 'accepted') {
      return { screen: SCREENS.DRIVER_FOUND, params: coords };
    }
    if (status === 'in_transit') {
      const phase: RideTrackPhase = 'in_progress';
      return { screen: SCREENS.TRACK_RIDE, params: { ...coords, phase } };
    }
    return null;
  }

  if (type === 'parcel') {
    if (status === 'pending') {
      return {
        screen: SCREENS.SEND_PARCEL_FINDING,
        params: { ...coords, createdAt: booking.created_at ?? undefined },
      };
    }
    if (status === 'accepted') {
      return { screen: SCREENS.COURIER_MATCHED, params: coords };
    }
    if (status === 'in_transit') {
      const phase: ParcelTrackPhase = 'in_transit';
      return { screen: SCREENS.TRACK_PARCEL, params: { ...coords, phase } };
    }
    return null;
  }

  if (type === 'food') {
    if (isTerminalBookingStatus(status)) return null;
    const phase = mapFoodOrderPhase(booking.status);
    return { screen: SCREENS.TRACK_FOOD_ORDER, params: { bookingId: booking.id, phase } };
  }

  return null;
}

export function getConsumerTrackButtonLabel(booking: SnliftBooking): string | null {
  if (!buildConsumerBookingTrackTarget(booking)) return null;
  const status = (booking.status ?? 'pending').toLowerCase();
  const pendingLike =
    status === 'pending' || status === 'order_placed' || status === 'placing_order';
  return pendingLike ? 'View Live Status' : 'Track Order';
}

export function canCancelConsumerBooking(
  status: string | undefined,
  bookingType?: SnliftBooking['booking_type'],
): boolean {
  const s = (status ?? '').toLowerCase();
  if (bookingType === 'food') {
    return (
      s === 'pending' ||
      s === 'order_placed' ||
      s === 'placing_order' ||
      s === 'accepted' ||
      s === 'order_accepted' ||
      s === 'preparing'
    );
  }
  return s === 'pending' || s === 'accepted';
}

export function isPendingBookingStatus(status: string | undefined): boolean {
  return (status ?? '').toLowerCase() === 'pending';
}
