import { useEffect, useMemo, useRef, useState } from 'react';
import {
  coordinateAlongPolyline,
  extrapolatePastEnd,
  interpolateMapCoord,
  mapCoordDistanceApprox,
  type MapCoord,
} from 'utils/coordinateAlongPolyline';

export type NavStep = {
  instruction: string;
  distanceText: string;
};

function polylineLengthKm(coords: MapCoord[]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += mapCoordDistanceApprox(coords[i], coords[i + 1]);
  }
  return total * 111;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function parseDirectionSteps(
  legs: { steps?: { html_instructions?: string; distance?: { text?: string } }[] }[] | undefined,
): NavStep[] {
  const steps = legs?.[0]?.steps ?? [];
  return steps.map(step => ({
    instruction: stripHtml(step.html_instructions ?? 'Continue'),
    distanceText: step.distance?.text ?? '',
  }));
}

export function useWorkerLiveNavigation({
  routeCoords,
  durationMinutes,
  enabled,
}: {
  routeCoords: MapCoord[];
  durationMinutes: number;
  enabled: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [vehicleCoord, setVehicleCoord] = useState<MapCoord | null>(null);
  const routeKeyRef = useRef('');

  const routeKey = routeCoords.map(c => `${c.latitude},${c.longitude}`).join('|');

  useEffect(() => {
    if (routeKeyRef.current !== routeKey) {
      routeKeyRef.current = routeKey;
      setProgress(0);
      setVehicleCoord(routeCoords[0] ?? null);
    }
  }, [routeKey, routeCoords]);

  useEffect(() => {
    if (!enabled || routeCoords.length < 2) return undefined;

    const durationMs = Math.max((durationMinutes || 5) * 60 * 1000, 45000);
    const start = Date.now();
    let raf = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const linear = Math.min(1, elapsed / durationMs);
      const eased = linear < 0.5 ? 2 * linear * linear : 1 - (-2 * linear + 2) ** 2 / 2;
      const t = Math.min(0.92, eased);

      setProgress(t);

      const startPt = routeCoords[0];
      const nextPt = routeCoords[1] ?? startPt;
      const approachFrom = extrapolatePastEnd(
        nextPt,
        startPt,
        mapCoordDistanceApprox(nextPt, startPt) * 0.35,
      );
      const along = coordinateAlongPolyline(routeCoords, t);
      const coord =
        t < 0.06
          ? interpolateMapCoord(approachFrom, startPt, t / 0.06)
          : along;
      setVehicleCoord(coord);

      if (linear < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, routeCoords, durationMinutes, routeKey]);

  const totalKm = useMemo(() => polylineLengthKm(routeCoords), [routeCoords]);

  const distanceRemainingKm = useMemo(() => {
    const rem = totalKm * (1 - progress);
    return Math.max(0.1, rem);
  }, [totalKm, progress]);

  const etaMinutes = useMemo(() => {
    const mins = Math.ceil((durationMinutes || 5) * (1 - progress));
    return Math.max(1, mins);
  }, [durationMinutes, progress]);

  return {
    progress,
    vehicleCoord,
    distanceRemainingKm,
    etaMinutes,
    distanceLabel: `${distanceRemainingKm.toFixed(1)} km`,
    etaLabel: `${etaMinutes} min`,
  };
}

export function getActiveNavStep(steps: NavStep[], progress: number): NavStep {
  if (!steps.length) {
    return {
      instruction: 'Continue straight',
      distanceText: 'On route',
    };
  }
  const index = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  return steps[index];
}
