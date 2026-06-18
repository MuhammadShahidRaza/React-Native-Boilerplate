import { INITIAL_REGION } from 'constants/common';
import type { SnliftBooking } from 'types/snliftApi';

const LAT = INITIAL_REGION.latitude;
const LNG = INITIAL_REGION.longitude;

const MOCK_PROVIDER = {
  id: 101,
  full_name: 'John Doe',
  phone: '+01000000000',
  vehicle_model: 'Toyota Corolla',
  vehicle_color: 'Black',
  vehicle_license_plate: 'AA-001-AA',
};

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function rideBooking(
  id: number,
  status: string,
  createdAt: string,
  extra?: Partial<SnliftBooking>,
): SnliftBooking {
  return {
    id,
    booking_type: 'ride',
    status,
    created_at: createdAt,
    pickup_address: '67 Murray Street, NY',
    dropoff_address: '85 W Broadway, NY',
    pickup_latitude: LAT + 0.005,
    pickup_longitude: LNG - 0.003,
    dropoff_latitude: LAT - 0.008,
    dropoff_longitude: LNG + 0.006,
    distance_km: 4.2,
    total_amount: 330,
    estimated_amount: 330,
    provider_id: status === 'pending' ? null : MOCK_PROVIDER.id,
    provider: status === 'pending' ? undefined : MOCK_PROVIDER,
    ...extra,
  };
}

function foodBooking(
  id: number,
  status: string,
  createdAt: string,
  extra?: Partial<SnliftBooking>,
): SnliftBooking {
  return {
    id,
    booking_type: 'food',
    status,
    created_at: createdAt,
    restaurant_id: 1,
    restaurant: { id: 1, name: 'Burger Lab' },
    pickup_address: 'Burger Lab',
    delivery_address: '12 Oak Avenue, NY',
    dropoff_address: '12 Oak Avenue, NY',
    pickup_latitude: LAT + 0.006,
    pickup_longitude: LNG - 0.004,
    dropoff_latitude: LAT - 0.005,
    dropoff_longitude: LNG + 0.006,
    distance_km: 3.8,
    total_amount: 1850,
    estimated_amount: 1850,
    delivery_fee: 50,
    provider_id: ['order_placed', 'placing_order', 'pending'].includes(status) ? null : MOCK_PROVIDER.id,
    provider: ['order_placed', 'placing_order', 'pending'].includes(status) ? undefined : MOCK_PROVIDER,
    ...extra,
  };
}

function parcelBooking(
  id: number,
  status: string,
  createdAt: string,
  extra?: Partial<SnliftBooking>,
): SnliftBooking {
  return {
    id,
    booking_type: 'parcel',
    status,
    created_at: createdAt,
    pickup_address: 'Central Station, NY',
    dropoff_address: 'Airport Terminal 2, NY',
    pickup_latitude: LAT + 0.004,
    pickup_longitude: LNG - 0.002,
    dropoff_latitude: LAT - 0.01,
    dropoff_longitude: LNG + 0.008,
    distance_km: 12.3,
    total_amount: 2450,
    estimated_amount: 2450,
    provider_id: status === 'pending' ? null : MOCK_PROVIDER.id,
    provider: status === 'pending' ? undefined : MOCK_PROVIDER,
    ...extra,
  };
}

/** Alpha-phase consumer bookings — all service types and statuses for Activity / detail screens. */
export const ALPHA_CONSUMER_BOOKINGS: SnliftBooking[] = [
  // —— Active: Ride ——
  rideBooking(1001, 'pending', daysAgo(0)),
  rideBooking(1002, 'accepted', daysAgo(0)),
  rideBooking(1003, 'in_transit', daysAgo(0)),
  // —— Active: Food ——
  foodBooking(2001, 'order_placed', daysAgo(0)),
  foodBooking(2002, 'preparing', daysAgo(0)),
  foodBooking(2003, 'order_accepted', daysAgo(0)),
  foodBooking(2004, 'picked_up', daysAgo(0)),
  foodBooking(2005, 'on_the_way', daysAgo(0)),
  foodBooking(2006, 'accepted', daysAgo(0)),
  // —— Active: Parcel ——
  parcelBooking(3001, 'pending', daysAgo(0)),
  parcelBooking(3002, 'accepted', daysAgo(0)),
  parcelBooking(3003, 'in_transit', daysAgo(0)),
  // —— History ——
  rideBooking(1004, 'completed', daysAgo(2), { completed_at: daysAgo(2) }),
  foodBooking(2007, 'delivered', daysAgo(3), { completed_at: daysAgo(3) }),
  parcelBooking(3004, 'completed', daysAgo(5), { completed_at: daysAgo(5) }),
  rideBooking(1005, 'cancelled', daysAgo(7), {
    cancellation_reason: 'Changed plans',
  }),
];

export function getAlphaConsumerBookings(): SnliftBooking[] {
  return ALPHA_CONSUMER_BOOKINGS;
}

export function getAlphaConsumerBookingById(
  id: number | string,
): SnliftBooking | undefined {
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(numericId)) return undefined;
  return ALPHA_CONSUMER_BOOKINGS.find(b => b.id === numericId);
}
