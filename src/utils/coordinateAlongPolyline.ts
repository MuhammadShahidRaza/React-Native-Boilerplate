export type MapCoord = { latitude: number; longitude: number };

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
