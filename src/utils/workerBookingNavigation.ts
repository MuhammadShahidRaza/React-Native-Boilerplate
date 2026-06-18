import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import type { SnliftBookingStatus, SnliftBookingType } from 'types/snliftApi';

function normalizeStatus(status: SnliftBookingStatus | string | undefined): string {
  return (status ?? 'pending').toLowerCase();
}

const TERMINAL_STATUSES = new Set([
  'completed',
  'complete',
  'delivered',
  'finished',
  'cancelled',
  'canceled',
]);

/** Food: restaurant accepted / preparing — courier can still accept or reject. */
const FOOD_COURIER_PENDING = new Set([
  'pending',
  'placing_order',
  'order_placed',
  'order_accepted',
  'preparing',
]);

const FOOD_COURIER_ACTIVE = new Set(['accepted', 'picked_up', 'in_transit', 'on_the_way']);

export function isWorkerTerminalBookingStatus(status: SnliftBookingStatus | string | undefined): boolean {
  return TERMINAL_STATUSES.has(normalizeStatus(status));
}

export function isWorkerRequestPending(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): boolean {
  const s = normalizeStatus(status);
  if (isWorkerTerminalBookingStatus(s)) return false;
  if (serviceType === 'food') return FOOD_COURIER_PENDING.has(s);
  return s === 'pending';
}

export function isWorkerActiveJob(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): boolean {
  const s = normalizeStatus(status);
  if (serviceType === 'food') return FOOD_COURIER_ACTIVE.has(s);
  return s === 'accepted' || s === 'in_transit';
}

export function workerJobNavigationPhase(
  status: SnliftBookingStatus | string | undefined,
  serviceType?: SnliftBookingType | string,
): 'pickup' | 'dropoff' {
  const s = normalizeStatus(status);
  if (serviceType === 'food') {
    if (s === 'picked_up' || s === 'in_transit' || s === 'on_the_way') return 'dropoff';
    return 'pickup';
  }
  return s === 'in_transit' ? 'dropoff' : 'pickup';
}

/** Open the worker flow screen that matches booking status. */
export function navigateToWorkerBooking(
  requestId: string,
  status?: SnliftBookingStatus | string,
  serviceType?: SnliftBookingType | string,
): void {
  const s = normalizeStatus(status);

  if (isWorkerTerminalBookingStatus(s)) {
    navigate(SCREENS.WORKER_JOB_COMPLETED, { requestId });
    return;
  }

  if (isWorkerActiveJob(s, serviceType)) {
    navigate(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId,
      phase: workerJobNavigationPhase(s, serviceType),
    });
    return;
  }

  navigate(SCREENS.WORKER_REQUEST_DETAIL, { requestId });
}
