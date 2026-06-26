type BookingUpdateListener = (bookingId: number) => void;

const listeners = new Set<BookingUpdateListener>();

/** Subscribe to booking-update pushes — lets an open tracking screen refresh immediately. */
export function subscribeBookingUpdate(listener: BookingUpdateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Call when a push notification about a booking arrives, so any open tracking screen can re-poll now. */
export function notifyBookingUpdated(bookingId: number | undefined | null): void {
  if (bookingId == null) return;
  listeners.forEach(listener => {
    try {
      listener(bookingId);
    } catch {
      // Ignore listener errors so one bad subscriber does not block others.
    }
  });
}
