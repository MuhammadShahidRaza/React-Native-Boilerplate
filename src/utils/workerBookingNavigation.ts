import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import type { SnliftBookingStatus } from 'types/snliftApi';

function normalizeStatus(status: SnliftBookingStatus | string | undefined): string {
  return (status ?? 'pending').toLowerCase();
}

/** Open the worker flow screen that matches booking status. */
export function navigateToWorkerBooking(
  requestId: string,
  status?: SnliftBookingStatus | string,
): void {
  const s = normalizeStatus(status);

  if (s === 'completed' || s === 'complete' || s === 'delivered' || s === 'finished') {
    navigate(SCREENS.WORKER_JOB_COMPLETED, { requestId });
    return;
  }

  if (s === 'accepted' || s === 'in_transit') {
    navigate(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId,
      phase: s === 'in_transit' ? 'dropoff' : 'pickup',
    });
    return;
  }

  navigate(SCREENS.WORKER_REQUEST_DETAIL, { requestId });
}
