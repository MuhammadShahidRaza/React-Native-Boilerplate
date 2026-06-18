import { SCREENS } from 'constants/routes';
import type { SnliftBooking } from 'types/snliftApi';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';

import { parseMapCoord } from 'utils/bookingCoords';
import {
  BOOKING_STATUS,
  canCancelFoodBooking,
  normalizeBookingStatus,
} from 'utils/bookingStatuses';
import { isTerminalBookingStatus, mapFoodOrderPhase, mapParcelTrackPhase } from 'utils/bookingTrackPhases';

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
  const status = normalizeBookingStatus(booking.status);
  const type = booking.booking_type ?? 'ride';
  const coords = bookingCoords(booking);

  if (type === 'ride') {
    if (status === BOOKING_STATUS.PENDING) {
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
    if (status === BOOKING_STATUS.ACCEPTED || status === BOOKING_STATUS.ARRIVED) {
      return { screen: SCREENS.DRIVER_FOUND, params: coords };
    }
    if (
      status === BOOKING_STATUS.PICKED_UP ||
      status === BOOKING_STATUS.IN_TRANSIT
    ) {
      const phase: RideTrackPhase = 'in_progress';
      return { screen: SCREENS.TRACK_RIDE, params: { ...coords, phase } };
    }
    return null;
  }

  if (type === 'parcel') {
    if (status === BOOKING_STATUS.PENDING) {
      return {
        screen: SCREENS.SEND_PARCEL_FINDING,
        params: { ...coords, createdAt: booking.created_at ?? undefined },
      };
    }
    if (
      status === BOOKING_STATUS.ACCEPTED ||
      status === BOOKING_STATUS.ARRIVED ||
      status === BOOKING_STATUS.READY_FOR_PICKUP
    ) {
      return { screen: SCREENS.COURIER_MATCHED, params: coords };
    }
    if (status === BOOKING_STATUS.PICKED_UP || status === BOOKING_STATUS.IN_TRANSIT) {
      const phase = mapParcelTrackPhase(booking.status);
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
  const s = normalizeBookingStatus(status);
  if (bookingType === 'food') return canCancelFoodBooking(s);
  return s === BOOKING_STATUS.PENDING || s === BOOKING_STATUS.ACCEPTED;
}

export function isPendingBookingStatus(status: string | undefined): boolean {
  return (status ?? '').toLowerCase() === 'pending';
}
