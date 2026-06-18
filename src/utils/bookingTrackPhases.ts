import type { FoodOrderPhase } from 'types/foodOrderTracking';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { haversineDistanceKm } from 'utils/distance';

const ARRIVED_KM = 0.08;

export function mapRideTrackPhase(
  status: string | undefined,
  providerCoord: MapCoord | null,
  pickupCoord: MapCoord,
): RideTrackPhase {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'in_transit') return 'in_progress';
  if (s === 'accepted') {
    if (providerCoord && haversineDistanceKm(
      providerCoord.latitude,
      providerCoord.longitude,
      pickupCoord.latitude,
      pickupCoord.longitude,
    ) < ARRIVED_KM) {
      return 'arrived';
    }
    return 'arriving';
  }
  return 'arriving';
}

export function mapParcelTrackPhase(status: string | undefined): ParcelTrackPhase {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed') return 'delivered';
  if (s === 'in_transit') return 'in_transit';
  return 'picked_up';
}

export function mapFoodOrderPhase(status: string | undefined): FoodOrderPhase {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed' || s === 'delivered' || s === 'complete') return 'delivered';
  if (s === 'in_transit' || s === 'on_the_way') return 'on_the_way';
  if (s === 'picked_up') return 'picked_up';
  if (s === 'preparing' || s === 'order_accepted') return 'preparing';
  if (s === 'accepted') return 'preparing';
  if (s === 'placing_order') return 'placing_order';
  if (s === 'pending' || s === 'order_placed') return 'order_placed';
  return 'order_placed';
}

export function isTerminalBookingStatus(status: string | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return (
    s === 'completed' ||
    s === 'complete' ||
    s === 'delivered' ||
    s === 'cancelled' ||
    s === 'canceled'
  );
}
