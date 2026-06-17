import { useEffect, useState } from 'react';
import { MOCK_FOOD_ORDER } from 'components/common/food/foodOrderMock';
import { ENV_CONSTANTS } from 'constants/common';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export type FoodOrderDisplay = {
  restaurantName: string;
  etaLabel: string;
  courierName: string;
  courierPhone: string;
  vehicleType: string;
  licensePlate: string;
  vehicleColor: string;
  pickup: MapCoord;
  dropoff: MapCoord;
  providerId: number | null;
};

function toCoord(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined,
  fallback: MapCoord,
): MapCoord {
  const la = typeof lat === 'number' ? lat : parseFloat(String(lat ?? ''));
  const lo = typeof lng === 'number' ? lng : parseFloat(String(lng ?? ''));
  if (Number.isNaN(la) || Number.isNaN(lo) || (la === 0 && lo === 0)) return fallback;
  return { latitude: la, longitude: lo };
}

function mapBookingToFoodOrder(
  booking: NonNullable<ReturnType<typeof extractBookingFromResponse>>,
): FoodOrderDisplay {
  const provider = booking.provider;
  const pickup = toCoord(booking.pickup_latitude, booking.pickup_longitude, MOCK_FOOD_ORDER.pickup);
  const dropoff = toCoord(booking.dropoff_latitude, booking.dropoff_longitude, MOCK_FOOD_ORDER.dropoff);

  return {
    restaurantName: booking.restaurant?.name ?? 'Restaurant',
    etaLabel: '—',
    courierName: provider?.full_name ?? 'Courier',
    courierPhone: provider?.phone ?? '',
    vehicleType: provider?.vehicle_type ?? provider?.vehicle_model ?? '—',
    licensePlate: provider?.vehicle_license_plate ?? '—',
    vehicleColor: provider?.vehicle_color ?? '—',
    pickup,
    dropoff,
    providerId: provider?.id ?? booking.provider_id ?? null,
  };
}

/** Alpha: static mock order. Beta: load restaurant/courier/coords from booking API. */
export function useFoodOrderDisplay(bookingId?: number | string) {
  const alphaOrder: FoodOrderDisplay = { ...MOCK_FOOD_ORDER, providerId: null };

  const [order, setOrder] = useState<FoodOrderDisplay | null>(() =>
    ENV_CONSTANTS.IS_ALPHA_PHASE ? alphaOrder : null,
  );
  const [loading, setLoading] = useState(!ENV_CONSTANTS.IS_ALPHA_PHASE);

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setOrder(alphaOrder);
      setLoading(false);
      return;
    }
    if (!bookingId) {
      setOrder(null);
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
      setOrder(booking ? mapBookingToFoodOrder(booking) : null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return { order, loading };
}
