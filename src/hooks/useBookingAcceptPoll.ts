import { useEffect, useRef } from 'react';
import { pollBookingAcceptStatus } from 'api/functions/snlift/bookings';

import { BOOKING_STATUS, normalizeBookingStatus } from 'utils/bookingStatuses';

const DEFAULT_POLL_MS = 8000;

const PROVIDER_MATCHED_STATUSES = new Set([
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.PREPARING,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
]);

/** Poll until provider accepts. Falls back to booking detail when tracking API is unavailable. */
export function useBookingAcceptPoll(
  bookingId: number | undefined,
  onAccepted: () => void,
) {
  const onAcceptedRef = useRef(onAccepted);
  onAcceptedRef.current = onAccepted;

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const schedule = (delayMs: number) => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void tick();
      }, delayMs);
    };

    const tick = async () => {
      if (cancelled) return;

      const result = await pollBookingAcceptStatus(bookingId, 'user');
      if (cancelled) return;

      const status = normalizeBookingStatus(result?.status);
      if (PROVIDER_MATCHED_STATUSES.has(status)) {
        onAcceptedRef.current();
        return;
      }

      const pollSeconds = Number(result?.pollAfterSeconds);
      const delayMs =
        Number.isFinite(pollSeconds) && pollSeconds > 0
          ? pollSeconds * 1000
          : DEFAULT_POLL_MS;
      schedule(delayMs);
    };

    void tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [bookingId]);
}
