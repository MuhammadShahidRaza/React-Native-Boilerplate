import type { FoodOrderPhase } from 'types/foodOrderTracking';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { haversineDistanceKm } from 'utils/distance';
import {
  BOOKING_STATUS,
  FOOD_RESTAURANT_ACCEPTED_STATUSES,
  FOOD_RESTAURANT_WAIT,
  normalizeBookingStatus,
} from 'utils/bookingStatuses';

export { isTerminalBookingStatus, normalizeBookingStatus } from 'utils/bookingStatuses';

const ARRIVED_KM = 0.08;

export function mapRideTrackPhase(
  status: string | undefined,
  providerCoord: MapCoord | null,
  pickupCoord: MapCoord,
): RideTrackPhase {
  const s = normalizeBookingStatus(status);
  if (s === BOOKING_STATUS.COMPLETED) return 'completed';
  if (s === BOOKING_STATUS.IN_TRANSIT || s === BOOKING_STATUS.PICKED_UP) return 'in_progress';
  if (s === BOOKING_STATUS.ARRIVED) return 'arrived';
  if (s === BOOKING_STATUS.ACCEPTED) {
    if (
      providerCoord &&
      haversineDistanceKm(
        providerCoord.latitude,
        providerCoord.longitude,
        pickupCoord.latitude,
        pickupCoord.longitude,
      ) < ARRIVED_KM
    ) {
      return 'arrived';
    }
    return 'arriving';
  }
  return 'arriving';
}

export function mapParcelTrackPhase(status: string | undefined): ParcelTrackPhase {
  const s = normalizeBookingStatus(status);
  if (s === BOOKING_STATUS.COMPLETED) return 'delivered';
  if (s === BOOKING_STATUS.IN_TRANSIT) return 'in_transit';
  if (s === BOOKING_STATUS.PICKED_UP) return 'picked_up';
  if (s === BOOKING_STATUS.READY_FOR_PICKUP) return 'ready_for_pickup';
  if (s === BOOKING_STATUS.ARRIVED) return 'arrived';
  if (s === BOOKING_STATUS.ACCEPTED) return 'accepted';
  return 'accepted';
}

export function mapFoodOrderPhase(status: string | undefined): FoodOrderPhase {
  const s = normalizeBookingStatus(status);
  if (s === BOOKING_STATUS.COMPLETED) return 'delivered';
  if (s === BOOKING_STATUS.IN_TRANSIT) return 'in_transit';
  if (s === BOOKING_STATUS.PICKED_UP) return 'picked_up';
  if (s === BOOKING_STATUS.READY_FOR_PICKUP) return 'ready_for_pickup';
  if (s === BOOKING_STATUS.PREPARING) return 'preparing';
  if (s === BOOKING_STATUS.ACCEPTED) return 'order_accepted';
  if (s === BOOKING_STATUS.PLACING_ORDER) return 'placing_order';
  if (FOOD_RESTAURANT_WAIT.has(s)) return 'order_placed';
  return 'order_placed';
}

export function isFoodRestaurantAccepted(status: string | undefined): boolean {
  return FOOD_RESTAURANT_ACCEPTED_STATUSES.has(normalizeBookingStatus(status));
}
