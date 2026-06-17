import { progressAlongPolylineFromPoint, isValidMapCoord, type MapCoord } from 'utils/coordinateAlongPolyline';
import { haversineDistanceKmExact } from 'utils/distance';
import { VARIABLES } from 'constants/common';
import type { IconComponentName } from 'types/iconTypes';

export type NavStep = {
  instruction: string;
  distanceText: string;
  maneuver?: string;
};

export type NavStepIcon = {
  componentName: IconComponentName;
  iconName: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function inferManeuverFromInstruction(instruction: string): string {
  const text = instruction.toLowerCase();

  if (text.includes('u-turn') || text.includes('uturn')) {
    return text.includes('left') ? 'uturn-left' : 'uturn-right';
  }
  if (text.includes('sharp left')) return 'turn-sharp-left';
  if (text.includes('sharp right')) return 'turn-sharp-right';
  if (text.includes('slight left') || text.includes('bear left')) return 'turn-slight-left';
  if (text.includes('slight right') || text.includes('bear right')) return 'turn-slight-right';
  if (text.includes('turn left') || text.includes('left onto') || text.includes('keep left')) {
    return 'turn-left';
  }
  if (text.includes('turn right') || text.includes('right onto') || text.includes('keep right')) {
    return 'turn-right';
  }
  if (text.includes('merge')) return 'merge';
  if (text.includes('roundabout')) return 'roundabout-right';
  if (text.includes('fork')) return text.includes('left') ? 'fork-left' : 'fork-right';
  return 'straight';
}

/** Map Google Directions maneuver / instruction text to a turn icon. */
export function resolveNavStepIcon(step: Pick<NavStep, 'maneuver' | 'instruction'>): NavStepIcon {
  const maneuver = (step.maneuver ?? inferManeuverFromInstruction(step.instruction)).toLowerCase();
  const iconSet = VARIABLES.MaterialCommunityIcons;

  if (maneuver.includes('uturn') || maneuver.includes('u-turn')) {
    return {
      componentName: iconSet,
      iconName: maneuver.includes('left') ? 'arrow-u-left-top' : 'arrow-u-right-top',
    };
  }
  if (maneuver.includes('sharp-left') || maneuver === 'turn-left') {
    return { componentName: iconSet, iconName: 'arrow-left-bold' };
  }
  if (maneuver.includes('sharp-right') || maneuver === 'turn-right') {
    return { componentName: iconSet, iconName: 'arrow-right-bold' };
  }
  if (
    maneuver.includes('slight-left') ||
    maneuver.includes('keep-left') ||
    maneuver.includes('ramp-left') ||
    maneuver.includes('fork-left') ||
    maneuver.includes('roundabout-left')
  ) {
    return { componentName: iconSet, iconName: 'arrow-top-left' };
  }
  if (
    maneuver.includes('slight-right') ||
    maneuver.includes('keep-right') ||
    maneuver.includes('ramp-right') ||
    maneuver.includes('fork-right') ||
    maneuver.includes('roundabout-right')
  ) {
    return { componentName: iconSet, iconName: 'arrow-top-right' };
  }
  if (maneuver.includes('merge')) {
    return { componentName: iconSet, iconName: 'merge' };
  }
  if (maneuver.includes('roundabout')) {
    return { componentName: iconSet, iconName: 'rotate-right' };
  }

  return { componentName: iconSet, iconName: 'arrow-up-bold' };
}

export function parseDirectionSteps(
  legs:
    | {
        steps?: {
          html_instructions?: string;
          distance?: { text?: string };
          maneuver?: string;
        }[];
      }[]
    | undefined,
): NavStep[] {
  const steps = legs?.[0]?.steps ?? [];
  return steps.map(step => ({
    instruction: stripHtml(step.html_instructions ?? 'Continue'),
    distanceText: step.distance?.text ?? '',
    maneuver: step.maneuver,
  }));
}

export function getActiveNavStep(steps: NavStep[], progress: number): NavStep {
  if (!steps.length) {
    return {
      instruction: 'Continue on route',
      distanceText: 'On route',
    };
  }
  const index = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  return steps[index];
}

export type WorkerRouteMetrics = {
  distanceKm: number;
  durationMin: number;
};

export function computeRemainingEtaMinutes(
  routeMetrics: WorkerRouteMetrics,
  remainingKm: number,
): number {
  const totalKm = Math.max(0.1, routeMetrics.distanceKm);
  const totalMin = Math.max(1, routeMetrics.durationMin);
  const ratio = Math.min(1, Math.max(0, remainingKm / totalKm));
  return Math.max(1, Math.ceil(totalMin * ratio));
}

export function navProgressForPosition(routeCoords: MapCoord[], position: MapCoord | null): number {
  if (!position || routeCoords.length < 2) return 0;
  return progressAlongPolylineFromPoint(routeCoords, position);
}

/** Driver/courier must be within this radius before pickup/dropoff status changes. */
export const WORKER_ARRIVAL_RADIUS_KM = 0.15;

export function isWorkerNearCoord(
  current: MapCoord | null | undefined,
  target: MapCoord,
  radiusKm = WORKER_ARRIVAL_RADIUS_KM,
): boolean {
  if (!current || !isValidMapCoord(target.latitude, target.longitude)) return false;
  if (!isValidMapCoord(current.latitude, current.longitude)) return false;

  const distanceKm = haversineDistanceKmExact(
    current.latitude,
    current.longitude,
    target.latitude,
    target.longitude,
  );

  return distanceKm <= radiusKm;
}

export function workerProximityBlockedMessage(phase: 'pickup' | 'dropoff'): string {
  return phase === 'pickup'
    ? 'Move closer to the pickup location before continuing.'
    : 'Move closer to the drop-off location before completing the job.';
}
