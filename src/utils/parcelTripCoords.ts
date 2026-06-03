import { INITIAL_REGION } from 'constants/common';
import type { ParcelTripCoords } from 'types/parcelTrip';
import type { MapCoord } from './coordinateAlongPolyline';

export type { MapCoord };

export function resolveParcelTripCoords(params?: ParcelTripCoords | null) {
  const pickup: MapCoord = {
    latitude: params?.pickupLat ?? INITIAL_REGION.latitude + 0.008,
    longitude: params?.pickupLng ?? INITIAL_REGION.longitude,
  };
  const dropoff: MapCoord = {
    latitude: params?.dropoffLat ?? INITIAL_REGION.latitude - 0.004,
    longitude: params?.dropoffLng ?? INITIAL_REGION.longitude + 0.005,
  };
  const mapRegion = {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2,
    latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 2 + 0.02,
  };
  return { pickup, dropoff, mapRegion };
}

export function parcelCoordsNavParams(
  pickup: MapCoord,
  dropoff: MapCoord,
  bookingId?: number,
): ParcelTripCoords {
  return {
    pickupLat: pickup.latitude,
    pickupLng: pickup.longitude,
    dropoffLat: dropoff.latitude,
    dropoffLng: dropoff.longitude,
    ...(bookingId != null ? { bookingId } : {}),
  };
}
