import type { SnliftBookingStatus, SnliftBookingType } from 'types/snliftApi';
import { COLORS } from 'utils/colors';

/** Canonical API booking statuses (shared across ride, food, parcel). */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPT: 'accept',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  /** Legacy / food placement */
  ORDER_PLACED: 'order_placed',
  PLACING_ORDER: 'placing_order',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
} as const;

export function normalizeBookingStatus(status?: string | null): string {
  const s = (status ?? BOOKING_STATUS.PENDING).toLowerCase();
  if (s === BOOKING_STATUS.ACCEPT) return BOOKING_STATUS.ACCEPTED;
  if (s === 'complete') return BOOKING_STATUS.COMPLETED;
  if (s === BOOKING_STATUS.ON_THE_WAY) return BOOKING_STATUS.IN_TRANSIT;
  if (s === BOOKING_STATUS.DELIVERED) return BOOKING_STATUS.COMPLETED;
  return s;
}

const TERMINAL = new Set([BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, 'canceled']);

export function isTerminalBookingStatus(status?: string | null): boolean {
  return TERMINAL.has(normalizeBookingStatus(status));
}

export function isWorkerTerminalBookingStatus(status?: string | null): boolean {
  return isTerminalBookingStatus(status);
}

export function isActiveBookingStatus(status?: string | null): boolean {
  return !isTerminalBookingStatus(status);
}

/** Food — restaurant waiting for accept. */
export const FOOD_RESTAURANT_WAIT = new Set<string>([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.ORDER_PLACED,
  BOOKING_STATUS.PLACING_ORDER,
]);

/** Food — restaurant accepted / preparing (consumer tracking, no courier yet). */
const FOOD_RESTAURANT_ACTIVE = new Set<string>([BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.PREPARING]);

/** Food — courier can accept/reject (including while restaurant is preparing). */
const FOOD_COURIER_PENDING = new Set<string>([BOOKING_STATUS.PREPARING]);

/** Food — courier active job. */
const FOOD_COURIER_ACTIVE = new Set<string>([
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
]);

/** Driver / ride — worker pending. */
const RIDE_WORKER_PENDING = new Set<string>([BOOKING_STATUS.PENDING]);

/** Driver / ride — worker active. */
const RIDE_WORKER_ACTIVE = new Set<string>([
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
]);

/** Parcel — worker pending. */
const PARCEL_WORKER_PENDING = new Set<string>([BOOKING_STATUS.PENDING]);

/** Parcel — worker active. */
const PARCEL_WORKER_ACTIVE = new Set<string>([
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
]);

export function isWorkerRequestPending(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): boolean {
  const s = normalizeBookingStatus(status);
  if (isTerminalBookingStatus(s)) return false;
  if (serviceType === 'food') return FOOD_COURIER_PENDING.has(s);
  if (serviceType === 'parcel') return PARCEL_WORKER_PENDING.has(s);
  return RIDE_WORKER_PENDING.has(s);
}

export function isWorkerActiveJob(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): boolean {
  const s = normalizeBookingStatus(status);
  if (serviceType === 'food') return FOOD_COURIER_ACTIVE.has(s);
  if (serviceType === 'parcel') return PARCEL_WORKER_ACTIVE.has(s);
  return RIDE_WORKER_ACTIVE.has(s);
}

export function workerJobNavigationPhase(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): 'pickup' | 'dropoff' {
  const s = normalizeBookingStatus(status);
  if (serviceType === 'food' || serviceType === 'parcel' || serviceType === 'ride') {
    if (s === BOOKING_STATUS.PICKED_UP || s === BOOKING_STATUS.IN_TRANSIT) return 'dropoff';
  }
  return 'pickup';
}

/** Statuses that mean restaurant accepted the food order (consumer poll). */
export const FOOD_RESTAURANT_ACCEPTED_STATUSES = new Set<string>([
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.PREPARING,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
  BOOKING_STATUS.COMPLETED,
]);

export function canCancelFoodBooking(status?: string | null): boolean {
  const s = normalizeBookingStatus(status);
  return (
    FOOD_RESTAURANT_WAIT.has(s) ||
    FOOD_RESTAURANT_ACTIVE.has(s) ||
    s === BOOKING_STATUS.READY_FOR_PICKUP
  );
}

export function getBookingStatusLabel(status: SnliftBookingStatus | string | undefined): string {
  const map: Record<string, string> = {
    [BOOKING_STATUS.PENDING]: 'Pending',
    [BOOKING_STATUS.ACCEPTED]: 'Accepted',
    [BOOKING_STATUS.ARRIVED]: 'Arrived',
    [BOOKING_STATUS.PREPARING]: 'Preparing',
    [BOOKING_STATUS.READY_FOR_PICKUP]: 'Ready for Pickup',
    [BOOKING_STATUS.PICKED_UP]: 'Picked Up',
    [BOOKING_STATUS.IN_TRANSIT]: 'In Transit',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCELLED]: 'Cancelled',
    [BOOKING_STATUS.ORDER_PLACED]: 'Order Placed',
    [BOOKING_STATUS.PLACING_ORDER]: 'Placing Order',
    [BOOKING_STATUS.ON_THE_WAY]: 'In Transit',
    [BOOKING_STATUS.DELIVERED]: 'Delivered',
  };
  const s = normalizeBookingStatus(status);
  return map[s] ?? status ?? 'Pending';
}

/** Status badge/text color — red for cancelled, green for completed, brand colors in between. */
export function getBookingStatusColor(status: SnliftBookingStatus | string | undefined): string {
  const map: Record<string, string> = {
    [BOOKING_STATUS.PENDING]: '#F59E0B',
    [BOOKING_STATUS.ACCEPTED]: COLORS.APP_PRIMARY,
    [BOOKING_STATUS.ARRIVED]: COLORS.APP_PRIMARY,
    [BOOKING_STATUS.PREPARING]: COLORS.APP_PRIMARY,
    [BOOKING_STATUS.READY_FOR_PICKUP]: COLORS.APP_SECONDARY,
    [BOOKING_STATUS.PICKED_UP]: COLORS.APP_SECONDARY,
    [BOOKING_STATUS.IN_TRANSIT]: COLORS.APP_SECONDARY,
    [BOOKING_STATUS.COMPLETED]: '#16A34A',
    [BOOKING_STATUS.CANCELLED]: COLORS.RED,
  };
  const s = normalizeBookingStatus(status);
  return map[s] ?? COLORS.APP_PRIMARY;
}

export type WorkerServiceType = 'ride' | 'food' | 'parcel';

export type WorkerPickupStep = 'en_route' | 'arrived' | 'ready_for_pickup';

export type WorkerPickupStatusAdvance = {
  nextStatus: string;
  nextStep?: WorkerPickupStep;
  startDropoff?: boolean;
  followUpStatus?: string;
};

/** Next API status when worker taps primary CTA at pickup leg. */
export function getWorkerPickupStatusAdvance(
  serviceType: WorkerServiceType,
  step: WorkerPickupStep,
): WorkerPickupStatusAdvance | null {
  if (serviceType === 'ride') {
    if (step === 'en_route') {
      return { nextStatus: BOOKING_STATUS.ARRIVED, nextStep: 'arrived' };
    }
    if (step === 'arrived') {
      return {
        nextStatus: BOOKING_STATUS.PICKED_UP,
        startDropoff: true,
        followUpStatus: BOOKING_STATUS.IN_TRANSIT,
      };
    }
    return null;
  }

  if (serviceType === 'parcel') {
    if (step === 'en_route') {
      return { nextStatus: BOOKING_STATUS.ARRIVED, nextStep: 'arrived' };
    }
    if (step === 'arrived') {
      return { nextStatus: BOOKING_STATUS.READY_FOR_PICKUP, nextStep: 'ready_for_pickup' };
    }
    if (step === 'ready_for_pickup') {
      return {
        nextStatus: BOOKING_STATUS.PICKED_UP,
        startDropoff: true,
        followUpStatus: BOOKING_STATUS.IN_TRANSIT,
      };
    }
    return null;
  }

  // food courier — pickup at restaurant
  if (step === 'en_route') {
    return {
      nextStatus: BOOKING_STATUS.PICKED_UP,
      startDropoff: true,
      followUpStatus: BOOKING_STATUS.IN_TRANSIT,
    };
  }
  return null;
}

export function resolveWorkerPickupStep(
  serviceType: WorkerServiceType,
  status: string | undefined,
): WorkerPickupStep {
  const s = normalizeBookingStatus(status);
  if (serviceType === 'parcel') {
    if (s === BOOKING_STATUS.READY_FOR_PICKUP) return 'ready_for_pickup';
    if (s === BOOKING_STATUS.ARRIVED) return 'arrived';
  }
  if (serviceType === 'ride' && s === BOOKING_STATUS.ARRIVED) return 'arrived';
  return 'en_route';
}
