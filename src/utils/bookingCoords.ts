import type { SnliftBooking } from 'types/snliftApi';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export function parseMapCoord(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined,
): MapCoord | null {
  const latitude = typeof lat === 'number' ? lat : parseFloat(String(lat ?? ''));
  const longitude = typeof lng === 'number' ? lng : parseFloat(String(lng ?? ''));
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (latitude === 0 && longitude === 0) return null;
  return { latitude, longitude };
}

export function resolveBookingPickupCoord(
  sources: {
    tracking?: { latitude: number; longitude: number } | null;
    booking?: SnliftBooking | null;
    routeLat?: number;
    routeLng?: number;
  },
): MapCoord | null {
  return (
    parseMapCoord(sources.tracking?.latitude, sources.tracking?.longitude) ??
    parseMapCoord(sources.booking?.pickup_latitude, sources.booking?.pickup_longitude) ??
    parseMapCoord(sources.routeLat, sources.routeLng)
  );
}

export function resolveBookingDropoffCoord(
  sources: {
    tracking?: { latitude: number; longitude: number } | null;
    booking?: SnliftBooking | null;
    routeLat?: number;
    routeLng?: number;
  },
): MapCoord | null {
  return (
    parseMapCoord(sources.tracking?.latitude, sources.tracking?.longitude) ??
    parseMapCoord(sources.booking?.dropoff_latitude, sources.booking?.dropoff_longitude) ??
    parseMapCoord(sources.routeLat, sources.routeLng)
  );
}

export function buildMapRegion(pickup: MapCoord, dropoff: MapCoord) {
  return {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2,
    latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 2 + 0.02,
  };
}
