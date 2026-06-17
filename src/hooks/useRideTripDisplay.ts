import { useEffect, useState } from 'react';
import { MOCK_RIDE_TRIP } from 'components/common/ride/rideMockTrip';
import { ENV_CONSTANTS } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import { formatProviderRating } from 'api/normalizers/snlift';
import { formatMoney } from 'utils/currency';

export type RideTripDisplay = typeof MOCK_RIDE_TRIP;

export function mapBookingToRideTrip(
  booking: NonNullable<ReturnType<typeof extractBookingFromResponse>>,
): RideTripDisplay {
  const provider = booking.provider;
  const vehicleType = provider?.vehicle_type ?? provider?.vehicle_model ?? '—';
  const plate = provider?.vehicle_license_plate ?? '—';
  const color = provider?.vehicle_color ?? '—';

  return {
    driverName: provider?.full_name ?? 'Driver',
    rating: formatProviderRating(provider),
    avatar: provider?.profile_image ? { uri: provider.profile_image } : IMAGES.USER,
    providerId: provider?.id ?? booking.provider_id ?? null,
    providerPhone: provider?.phone ?? undefined,
    vehicleModel: provider?.vehicle_model ?? vehicleType,
    vehiclePlate: plate,
    vehicleStats: [
      { icon: 'car', label: 'Vehicle Type', value: vehicleType },
      { icon: 'card-text-outline', label: 'License Plate', value: plate },
      { icon: 'water', label: 'Color', value: color },
    ],
    estimateFare: formatMoney(booking.total_amount ?? booking.estimated_amount),
    paymentMethod: 'Cash',
  };
}

/** Alpha: static mock trip. Beta: load driver/vehicle from booking API. */
export function useRideTripDisplay(bookingId?: number | string) {
  const [trip, setTrip] = useState<RideTripDisplay | null>(() =>
    ENV_CONSTANTS.IS_ALPHA_PHASE ? MOCK_RIDE_TRIP : null,
  );
  const [loading, setLoading] = useState(!ENV_CONSTANTS.IS_ALPHA_PHASE);

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setTrip(MOCK_RIDE_TRIP);
      setLoading(false);
      return;
    }
    if (!bookingId) {
      setTrip(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      const silent = {
        showLoader: false,
        showError: false,
        silentErrors: true,
      };
      const res = await getBookingById(bookingId, 'user', silent);
      const booking = extractBookingFromResponse(res);

      if (cancelled) return;
      setTrip(booking ? mapBookingToRideTrip(booking) : null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return { trip, loading };
}
