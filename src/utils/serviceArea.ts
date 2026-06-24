import { isSengoBrand } from 'constants/assets/brandLogo';

/** Côte d'Ivoire bounding box. */
const IVORY_COAST_BOUNDS = {
  minLat: 4.34,
  maxLat: 10.74,
  minLng: -8.6,
  maxLng: -2.49,
};

export function isWithinIvoryCoast(latitude: number, longitude: number): boolean {
  return (
    latitude >= IVORY_COAST_BOUNDS.minLat &&
    latitude <= IVORY_COAST_BOUNDS.maxLat &&
    longitude >= IVORY_COAST_BOUNDS.minLng &&
    longitude <= IVORY_COAST_BOUNDS.maxLng
  );
}

/** SN Lift only operates in Ivory Coast; Sengo (alpha/demo brand) has no region restriction. */
export function isServiceAreaRestricted(): boolean {
  return !isSengoBrand();
}
