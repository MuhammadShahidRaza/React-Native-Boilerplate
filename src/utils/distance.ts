function parseDistanceKmValue(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const ESTIMATE_DISTANCE_KEYS = [
  'distance_km',
  'distance',
  'total_distance_km',
  'trip_distance_km',
  'delivery_distance_km',
] as const;

/** Read distance from estimate/booking payload — backend value used as-is when present. */
export function extractEstimateDistanceKm(source: unknown): number | null {
  if (!source || typeof source !== 'object') return null;
  const raw = source as Record<string, unknown>;

  for (const key of ESTIMATE_DISTANCE_KEYS) {
    const n = parseDistanceKmValue(raw[key]);
    if (n != null) return n;
  }

  const categories = raw.categories;
  if (Array.isArray(categories) && categories[0] && typeof categories[0] === 'object') {
    const cat = categories[0] as Record<string, unknown>;
    for (const key of ESTIMATE_DISTANCE_KEYS) {
      const n = parseDistanceKmValue(cat[key]);
      if (n != null) return n;
    }
  }

  const nested = raw.estimate;
  if (nested && typeof nested === 'object') {
    return extractEstimateDistanceKm(nested);
  }

  return null;
}

/** Great-circle distance in km (client fallback when estimate API has no distance_km). */
function haversineKmCore(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function haversineDistanceKmExact(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return haversineKmCore(lat1, lon1, lat2, lon2);
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return Math.max(0.1, Math.round(haversineKmCore(lat1, lon1, lat2, lon2) * 10) / 10);
}

export function formatDistanceKm(km: number | string | null | undefined): string {
  if (km === null || km === undefined || km === '') return '—';
  const n = typeof km === 'number' ? km : parseFloat(String(km));
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)} km`;
}

/** Prefer backend estimate distance; fall back to client haversine. */
export function resolveBookingDistanceKm(
  apiDistanceKm: number | string | Record<string, unknown> | null | undefined,
  fallbackKm: number,
): number {
  const fromApi =
    apiDistanceKm != null && typeof apiDistanceKm === 'object'
      ? extractEstimateDistanceKm(apiDistanceKm)
      : parseDistanceKmValue(apiDistanceKm);
  if (fromApi != null) return fromApi;
  return Math.max(0.1, Math.round(fallbackKm * 10) / 10);
}
