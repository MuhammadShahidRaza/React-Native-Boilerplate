import { useEffect, useState } from 'react';
import { MOCK_PARCEL_COURIER, PARCEL_COURIER_VEHICLE_STATS, formatParcelVehicleTypeLabel } from 'components/common/parcel/parcelMockCourier';
import { ENV_CONSTANTS } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import type { RideVehicleStatItem } from 'components/common/ride/RideVehicleStatsRow';

export type ParcelTripDisplay = {
  courierName: string;
  phone: string;
  avatar: typeof IMAGES.USER;
  trackingId: string;
  vehicleStats: RideVehicleStatItem[];
  providerId: number | null;
};

function mapBookingToParcelTrip(
  booking: NonNullable<ReturnType<typeof extractBookingFromResponse>>,
): ParcelTripDisplay {
  const provider = booking.provider;
  const vehicleType = formatParcelVehicleTypeLabel(
    provider?.vehicle_type ?? provider?.vehicle_model ?? 'Bike',
  );
  const plate = provider?.vehicle_license_plate ?? '—';
  const color = provider?.vehicle_color ?? '—';

  return {
    courierName: provider?.full_name ?? 'Courier',
    phone: provider?.phone ?? '',
    avatar: provider?.profile_image ? { uri: provider.profile_image } : IMAGES.USER,
    trackingId: `SN-${booking.id}`,
    providerId: provider?.id ?? booking.provider_id ?? null,
    vehicleStats: [
      { icon: 'bike', label: 'Vehicle Type', value: vehicleType },
      { icon: 'card-text-outline', label: 'License Plate', value: plate },
      { icon: 'water', label: 'Color', value: color },
    ],
  };
}

/** Alpha: static mock courier. Beta: load from booking API. */
export function useParcelTripDisplay(bookingId?: number | string) {
  const mockDisplay: ParcelTripDisplay = {
    courierName: MOCK_PARCEL_COURIER.courierName,
    phone: MOCK_PARCEL_COURIER.phone,
    avatar: MOCK_PARCEL_COURIER.avatar,
    trackingId: MOCK_PARCEL_COURIER.trackingId,
    providerId: null,
    vehicleStats: PARCEL_COURIER_VEHICLE_STATS,
  };

  const [trip, setTrip] = useState<ParcelTripDisplay | null>(() =>
    ENV_CONSTANTS.IS_ALPHA_PHASE ? mockDisplay : null,
  );
  const [loading, setLoading] = useState(!ENV_CONSTANTS.IS_ALPHA_PHASE);

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setTrip(mockDisplay);
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
      setTrip(booking ? mapBookingToParcelTrip(booking) : null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return { trip, loading };
}
