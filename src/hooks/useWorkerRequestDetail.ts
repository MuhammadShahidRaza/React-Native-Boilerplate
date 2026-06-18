import { useEffect, useState } from 'react';
import { ENV_CONSTANTS } from 'constants/common';
import {
  getWorkerRequestDetail,
  type WorkerRequestDetail,
} from 'components/common/worker/workerMockData';
import {
  extractBookingFromResponse,
  getBookingById,
  type BookingRole,
} from 'api/functions/snlift/bookings';
import { mapBookingToWorkerRequestDetail } from 'api/mappers/snliftBooking';
import { normalizeBookingStatus } from 'utils/bookingStatuses';
import type { SnliftBooking } from 'types/snliftApi';

type UseWorkerRequestDetailOptions = {
  initialBooking?: SnliftBooking | null;
};

export function useWorkerRequestDetail(
  requestId: string | undefined,
  role: BookingRole,
  options?: UseWorkerRequestDetailOptions,
) {
  const [detail, setDetail] = useState<WorkerRequestDetail | null>(() => {
    if (options?.initialBooking) {
      return mapBookingToWorkerRequestDetail(options.initialBooking);
    }
    if (ENV_CONSTANTS.IS_ALPHA_PHASE && requestId) {
      return getWorkerRequestDetail(requestId);
    }
    return null;
  });
  const [loading, setLoading] = useState(
    !options?.initialBooking && !ENV_CONSTANTS.IS_ALPHA_PHASE,
  );
  const [bookingCreatedAt, setBookingCreatedAt] = useState<string | undefined>();
  const [bookingStatus, setBookingStatus] = useState<string>(() =>
    normalizeBookingStatus(options?.initialBooking?.status),
  );

  useEffect(() => {
    if (options?.initialBooking) {
      setDetail(mapBookingToWorkerRequestDetail(options.initialBooking));
      if (options.initialBooking.created_at) {
        setBookingCreatedAt(options.initialBooking.created_at.trim());
      }
      setBookingStatus(normalizeBookingStatus(options.initialBooking.status));
      setLoading(false);
      return;
    }

    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      if (requestId) setDetail(getWorkerRequestDetail(requestId));
      setBookingStatus('pending');
      setLoading(false);
      return;
    }

    if (!requestId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      const res = await getBookingById(requestId, role, {
        showLoader: false,
        showError: false,
        silentErrors: true,
      });
      const booking = extractBookingFromResponse(res);
      if (cancelled) return;

      if (booking) {
        setDetail(mapBookingToWorkerRequestDetail(booking));
        if (booking.created_at) setBookingCreatedAt(booking.created_at.trim());
        setBookingStatus(normalizeBookingStatus(booking.status));
      } else {
        setDetail(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [requestId, role, options?.initialBooking]);

  return {
    detail,
    loading,
    bookingCreatedAt,
    bookingStatus,
    setBookingStatus,
  };
}
