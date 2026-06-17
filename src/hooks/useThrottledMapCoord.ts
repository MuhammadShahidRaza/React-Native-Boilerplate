import { useEffect, useRef, useState } from 'react';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { haversineDistanceKm } from 'utils/distance';

/** Throttle coord updates — e.g. directions origin so the route line does not redraw every GPS tick. */
export function useThrottledMapCoord(
  coord: MapCoord | null,
  minIntervalMs = 4000,
  minDistanceKm = 0.04,
): MapCoord | null {
  const [throttled, setThrottled] = useState<MapCoord | null>(coord);
  const lastRef = useRef<{ at: number; coord: MapCoord | null }>({ at: 0, coord });

  useEffect(() => {
    if (!coord) {
      setThrottled(null);
      lastRef.current = { at: 0, coord: null };
      return;
    }

    const now = Date.now();
    const prev = lastRef.current.coord;
    const elapsed = now - lastRef.current.at;
    const movedKm = prev
      ? haversineDistanceKm(prev.latitude, prev.longitude, coord.latitude, coord.longitude)
      : Number.POSITIVE_INFINITY;

    if (!prev || elapsed >= minIntervalMs || movedKm >= minDistanceKm) {
      lastRef.current = { at: now, coord };
      setThrottled(coord);
    }
  }, [coord, minIntervalMs, minDistanceKm]);

  return throttled;
}
