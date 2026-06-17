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
  if (s === 'completed') return 'delivered';
  if (s === 'in_transit') return 'on_the_way';
  if (s === 'accepted') return 'preparing';
  if (s === 'pending') return 'order_placed';
  return 'order_placed';
}
