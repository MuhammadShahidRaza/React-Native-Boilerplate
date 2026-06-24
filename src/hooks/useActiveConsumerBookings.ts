import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaConsumerBookings } from 'constants/consumerBookingMock';
import { getAlphaSessionBookings } from 'constants/alphaBookingMocks';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import { isActiveBookingStatus } from 'api/mappers/snliftBooking';
import type { SnliftBooking, SnliftBookingType } from 'types/snliftApi';

/** Consumer's currently active (non-terminal) bookings, refreshed on focus. */
export function useActiveConsumerBookings() {
  const [bookings, setBookings] = useState<SnliftBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef<Promise<SnliftBooking[]> | null>(null);

  const load = useCallback(async (): Promise<SnliftBooking[]> => {
    setLoading(true);
    const promise = (async () => {
      try {
        let active: SnliftBooking[];
        if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
          const all = [...getAlphaSessionBookings(), ...getAlphaConsumerBookings()];
          active = all.filter(b => isActiveBookingStatus(b.status));
        } else {
          const res = await listBookings(undefined, 'user', { showLoader: false });
          active = extractBookingsList(res).filter(b => isActiveBookingStatus(b.status));
        }
        setBookings(active);
        return active;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = promise;
    return promise;
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const getActiveBooking = useCallback(
    (type: SnliftBookingType) => bookings.find(b => b.booking_type === type),
    [bookings],
  );

  /** Awaits any in-flight fetch so callers always check against fresh data, not stale state. */
  const ensureLoaded = useCallback((): Promise<SnliftBooking[]> => {
    return inFlightRef.current ?? Promise.resolve(bookings);
  }, [bookings]);

  return { bookings, loading, getActiveBooking, refetch: load, ensureLoaded };
}
