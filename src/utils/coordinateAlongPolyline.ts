export type MapCoord = { latitude: number; longitude: number };

export function parseMapCoord(value: number | string | null | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

export function isValidMapCoord(lat: number, lng: number): boolean {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && Math.abs(lat) > 0.0001 && Math.abs(lng) > 0.0001;
}

function segmentMetric(a: MapCoord, b: MapCoord): number {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/** Quick geo distance proxy in lat/lng space (good enough for short route segments). */
export function mapCoordDistanceApprox(a: MapCoord, b: MapCoord): number {
  return segmentMetric(a, b);
}

export function interpolateMapCoord(a: MapCoord, b: MapCoord, t: number): MapCoord {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

/** Point `t ∈ [0,1]` fraction of cumulative path length (first coord → … → last coord). */
export function coordinateAlongPolyline(coords: MapCoord[], t: number): MapCoord {
  const clampedT = Math.max(0, Math.min(1, t));
  if (!coords.length) return { latitude: 0, longitude: 0 };
  if (coords.length === 1) return coords[0];

  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const d = segmentMetric(coords[i], coords[i + 1]);
    lengths.push(d);
    total += d;
  }

  if (total <= 0) return coords[coords.length - 1];

  let remaining = clampedT * total;
  for (let i = 0; i < lengths.length; i++) {
    const segLen = lengths[i];
    if (remaining <= segLen || i === lengths.length - 1) {
      const segT = segLen > 0 ? remaining / segLen : 0;
      return interpolateMapCoord(coords[i], coords[i + 1], Math.min(1, Math.max(0, segT)));
    }
    remaining -= segLen;
  }
  return coords[coords.length - 1];
}

/** Closest-point progress `t ∈ [0,1]` along polyline for a live GPS position. */
export function progressAlongPolylineFromPoint(coords: MapCoord[], point: MapCoord): number {
  if (coords.length < 2) return 0;

  const segmentLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const d = segmentMetric(coords[i], coords[i + 1]);
    segmentLengths.push(d);
    total += d;
  }
  if (total <= 0) return 0;

  let bestDist = Infinity;
  let bestProgress = 0;
  let accumulated = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const abLat = b.latitude - a.latitude;
    const abLng = b.longitude - a.longitude;
    const ab2 = abLat * abLat + abLng * abLng;
    const t =
      ab2 > 0
        ? Math.max(
            0,
            Math.min(
              1,
              ((point.latitude - a.latitude) * abLat + (point.longitude - a.longitude) * abLng) /
                ab2,
            ),
          )
        : 0;
    const proj = interpolateMapCoord(a, b, t);
    const dist = segmentMetric(point, proj);
    if (dist < bestDist) {
      bestDist = dist;
      bestProgress = (accumulated + segmentLengths[i] * t) / total;
    }
    accumulated += segmentLengths[i];
  }

  return Math.max(0, Math.min(1, bestProgress));
}

/** Road-facing bearing at `point` along a directions polyline. */
export function bearingAlongPolyline(coords: MapCoord[], point: MapCoord): number | null {
  if (coords.length < 2) return null;
  const t = progressAlongPolylineFromPoint(coords, point);
  const segIndex = Math.min(coords.length - 2, Math.floor(t * (coords.length - 1)));
  return bearingBetweenCoords(coords[segIndex], coords[segIndex + 1]);
}

/** Bearing in degrees clockwise from true north (`from` → `to`). */
export function bearingBetweenCoords(from: MapCoord, to: MapCoord): number {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Extend past `end` along the line from `from` → `end`. */
export function extrapolatePastEnd(from: MapCoord, end: MapCoord, extension: number): MapCoord {
  const vx = end.latitude - from.latitude;
  const vy = end.longitude - from.longitude;
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  return {
    latitude: end.latitude + (vx / len) * extension,
    longitude: end.longitude + (vy / len) * extension,
  };
}
