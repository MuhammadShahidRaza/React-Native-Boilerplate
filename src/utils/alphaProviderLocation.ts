import type { SnliftBooking } from 'types/snliftApi';
import {
  bearingBetweenCoords,
  interpolateMapCoord,
  type MapCoord,
} from 'utils/coordinateAlongPolyline';
import { getVehicleMarkerHeading } from 'hooks/useWorkerGpsNavigation';
import { BOOKING_STATUS, normalizeBookingStatus } from 'utils/bookingStatuses';

const FOOD_NO_COURIER = new Set<string>([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.ORDER_PLACED,
  BOOKING_STATUS.PLACING_ORDER,
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.PREPARING,
]);

function hasAssignedProvider(booking: SnliftBooking): boolean {
  return Boolean(booking.provider_id ?? booking.provider?.id);
}

/** Simulated driver/courier position for alpha tracking maps. */
export function resolveAlphaProviderCoord(
  booking: SnliftBooking,
  pickup: MapCoord,
  dropoff: MapCoord,
  statusOverride?: string,
): MapCoord | null {
  if (!hasAssignedProvider(booking)) return null;

  const status = normalizeBookingStatus(statusOverride ?? booking.status);
  if (status === BOOKING_STATUS.COMPLETED || status === BOOKING_STATUS.CANCELLED) {
    return null;
  }

  if (booking.booking_type === 'food' && FOOD_NO_COURIER.has(status)) {
    return null;
  }

  if (
    status === BOOKING_STATUS.IN_TRANSIT ||
    status === BOOKING_STATUS.PICKED_UP
  ) {
    const progress = status === BOOKING_STATUS.PICKED_UP ? 0.28 : 0.58;
    return interpolateMapCoord(pickup, dropoff, progress);
  }

  if (
    status === BOOKING_STATUS.ARRIVED ||
    status === BOOKING_STATUS.READY_FOR_PICKUP
  ) {
    return interpolateMapCoord(pickup, dropoff, 0.04);
  }

  const approachStart = interpolateMapCoord(dropoff, pickup, 1.28);
  return interpolateMapCoord(approachStart, pickup, 0.72);
}

export function resolveAlphaProviderBearing(
  booking: SnliftBooking,
  pickup: MapCoord,
  dropoff: MapCoord,
  providerCoord: MapCoord,
  vehicleKind: 'car' | 'bike',
  statusOverride?: string,
): number {
  const status = normalizeBookingStatus(statusOverride ?? booking.status);
  const headingToDropoff =
    status === BOOKING_STATUS.IN_TRANSIT ||
    status === BOOKING_STATUS.PICKED_UP ||
    status === BOOKING_STATUS.READY_FOR_PICKUP;

  const target = headingToDropoff ? dropoff : pickup;
  return getVehicleMarkerHeading(bearingBetweenCoords(providerCoord, target), vehicleKind);
}
