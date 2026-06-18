import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import type { SnliftBookingStatus, SnliftBookingType } from 'types/snliftApi';
import {
  isWorkerActiveJob,
  isWorkerRequestPending,
  isWorkerTerminalBookingStatus,
  normalizeBookingStatus,
  workerJobNavigationPhase,
} from 'utils/bookingStatuses';

export {
  isWorkerActiveJob,
  isWorkerRequestPending,
  isWorkerTerminalBookingStatus,
  workerJobNavigationPhase,
} from 'utils/bookingStatuses';

/** Open the worker flow screen that matches booking status. */
export function navigateToWorkerBooking(
  requestId: string,
  status?: SnliftBookingStatus | string,
  serviceType?: SnliftBookingType | string,
): void {
  const s = normalizeBookingStatus(status);

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
