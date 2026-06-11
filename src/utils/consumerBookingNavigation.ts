import { SCREENS } from 'constants/routes';
import type { SnliftBooking } from 'types/snliftApi';
import type { FoodOrderPhase } from 'types/foodOrderTracking';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';

function toNum(value: number | string | null | undefined, fallback: number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isNaN(n) ? fallback : n;
}

export function buildConsumerBookingTrackTarget(booking: SnliftBooking): {
  screen: string;
  params: Record<string, unknown>;
} | null {
  const status = (booking.status ?? 'pending').toLowerCase();
  const type = booking.booking_type ?? 'ride';
  const bookingId = booking.id;
  const pickupLat = toNum(booking.pickup_latitude, 0);
  const pickupLng = toNum(booking.pickup_longitude, 0);
  const dropoffLat = toNum(booking.dropoff_latitude, 0);
  const dropoffLng = toNum(booking.dropoff_longitude, 0);
  const coords = { pickupLat, pickupLng, dropoffLat, dropoffLng, bookingId };

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
    if (status === 'pending' || status === 'accepted' || status === 'in_transit') {
      let phase: FoodOrderPhase = 'order_placed';
      if (status === 'accepted') phase = 'preparing';
      if (status === 'in_transit') phase = 'on_the_way';
      return { screen: SCREENS.TRACK_FOOD_ORDER, params: { bookingId, phase } };
    }
    return null;
  }

  return null;
}

export function canCancelConsumerBooking(status: string | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'pending' || s === 'accepted';
}

export function isPendingBookingStatus(status: string | undefined): boolean {
  return (status ?? '').toLowerCase() === 'pending';
}
