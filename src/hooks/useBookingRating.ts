import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaBookingById } from 'constants/alphaBookingMocks';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import type { SnliftBooking } from 'types/snliftApi';
import { extractBookingCustomerRating, submitBookingRating } from 'utils/bookingRating';
import { showToast } from 'utils/toast';

export function useBookingRating(
  bookingId: number | undefined,
  module: SnliftBooking['booking_type'] | undefined,
) {
  const [rating, setRating] = useState(0);
  const [savedRating, setSavedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSavedRating = useCallback(async () => {
    if (!bookingId) {
      setSavedRating(null);
      setRating(0);
      return;
    }

    let booking: SnliftBooking | null = null;
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      booking = getAlphaBookingById(bookingId) ?? null;
    } else {
      const res = await getBookingById(bookingId, 'user', {
        showLoader: false,
        showError: false,
        silentErrors: true,
      });
      booking = extractBookingFromResponse(res);
    }

    const saved = extractBookingCustomerRating(booking);
    setSavedRating(saved);
    if (saved != null) setRating(saved);
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      void loadSavedRating();
    }, [loadSavedRating]),
  );

  const submit = useCallback(async (): Promise<boolean> => {
    if (!bookingId || !module) return false;
    if (savedRating != null) return true;
    if (rating < 1) {
      showToast({ message: 'Please select a rating.' });
      return false;
    }

    setSubmitting(true);
    try {
      const ok = await submitBookingRating({ bookingId, module, rating });
      if (ok) {
        setSavedRating(rating);
        showToast({ message: 'Thank you for your rating!' , isError: false});
      } else {
        showToast({ message: 'Could not submit rating. Try again.', isError: true });
      }
      return ok;
    } finally {
      setSubmitting(false);
    }
  }, [bookingId, module, rating, savedRating]);

  return {
    rating,
    setRating,
    savedRating,
    hasRated: savedRating != null,
    submitting,
    submit,
    reload: loadSavedRating,
  };
}
