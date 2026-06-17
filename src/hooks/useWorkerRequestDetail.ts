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

export function useWorkerRequestDetail(requestId: string, role: BookingRole) {
  const [detail, setDetail] = useState<WorkerRequestDetail | null>(() =>
    ENV_CONSTANTS.IS_ALPHA_PHASE ? getWorkerRequestDetail(requestId) : null,
  );
  const [loading, setLoading] = useState(!ENV_CONSTANTS.IS_ALPHA_PHASE);
  const [bookingCreatedAt, setBookingCreatedAt] = useState<string | undefined>();
  const [bookingStatus, setBookingStatus] = useState<string>('pending');

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setDetail(getWorkerRequestDetail(requestId));
      setBookingStatus('pending');
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
        setBookingStatus((booking.status ?? 'pending').toLowerCase());
      } else {
        setDetail(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [requestId, role]);

  return {
    detail,
    loading,
    bookingCreatedAt,
    bookingStatus,
    setBookingStatus,
  };
}
