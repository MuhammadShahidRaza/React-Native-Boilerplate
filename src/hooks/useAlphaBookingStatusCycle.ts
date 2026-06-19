import { useEffect, useRef, useState } from 'react';
import { ENV_CONSTANTS } from 'constants/common';
import {
  getAlphaBookingById,
  updateAlphaSessionBookingStatus,
} from 'constants/alphaBookingMocks';
import {
  ALPHA_PHASE_DURATION_MS,
  resolveAlphaStatusSequence,
} from 'utils/alphaStatusCycle';
import {
  BOOKING_STATUS,
  isTerminalBookingStatus,
  normalizeBookingStatus,
} from 'utils/bookingStatuses';

type Options = {
  enabled?: boolean;
  /** When true (default), demo starts from the first status in the sequence. */
  restartFromFirst?: boolean;
};

/** Alpha demo — auto-advance booking status every 3 seconds through all track phases. */
export function useAlphaBookingStatusCycle(
  bookingId: number | string | undefined,
  options?: Options,
) {
  const enabled = ENV_CONSTANTS.IS_ALPHA_PHASE && (options?.enabled ?? true) && Boolean(bookingId);
  const restartFromFirst = options?.restartFromFirst ?? true;
  const [status, setStatus] = useState<string | null>(null);
  const [tickKey, setTickKey] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !bookingId) {
      setStatus(null);
      return undefined;
    }

    const booking = getAlphaBookingById(bookingId);
    const sequence = resolveAlphaStatusSequence(booking?.booking_type);

    if (restartFromFirst) {
      indexRef.current = 0;
    } else {
      const current = normalizeBookingStatus(booking?.status);
      const idx = sequence.findIndex(s => normalizeBookingStatus(s) === current);
      indexRef.current = idx >= 0 ? idx : 0;
    }

    const applyStatus = (nextStatus: string) => {
      updateAlphaSessionBookingStatus(bookingId, nextStatus);
      setStatus(nextStatus);
      setTickKey(k => k + 1);
    };

    applyStatus(sequence[indexRef.current]!);

    const intervalId = setInterval(() => {
      const latestBooking = getAlphaBookingById(bookingId);
      const seq = resolveAlphaStatusSequence(latestBooking?.booking_type);
      const currentStatus = normalizeBookingStatus(latestBooking?.status);
      if (isTerminalBookingStatus(currentStatus) && currentStatus !== BOOKING_STATUS.COMPLETED) {
        clearInterval(intervalId);
        return;
      }

      const nextIndex = indexRef.current + 1;
      if (nextIndex >= seq.length) {
        clearInterval(intervalId);
        return;
      }

      indexRef.current = nextIndex;
      applyStatus(seq[nextIndex]!);
    }, ALPHA_PHASE_DURATION_MS);

    return () => clearInterval(intervalId);
  }, [bookingId, enabled, restartFromFirst]);

  return {
    status,
    tickKey,
    phaseDurationMs: ALPHA_PHASE_DURATION_MS,
    isAlpha: enabled,
  };
}
