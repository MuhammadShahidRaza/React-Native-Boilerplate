import { INITIAL_REGION } from 'constants/common';
import { BOOKING_STATUS } from 'utils/bookingStatuses';
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

const FOOD_NO_COURIER = new Set<string>([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.ORDER_PLACED,
  BOOKING_STATUS.PLACING_ORDER,
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.PREPARING,
  BOOKING_STATUS.READY_FOR_PICKUP,
]);

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
    provider_id: status === BOOKING_STATUS.PENDING ? null : MOCK_PROVIDER.id,
    provider: status === BOOKING_STATUS.PENDING ? undefined : MOCK_PROVIDER,
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
    items: [
      { menu_item_id: 1001, quantity: 2, name: 'Classic Burger', price: 450 },
      { menu_item_id: 1003, quantity: 1, name: 'Crispy Fries', price: 180 },
    ],
    provider_id: FOOD_NO_COURIER.has(status) ? null : MOCK_PROVIDER.id,
    provider: FOOD_NO_COURIER.has(status) ? undefined : MOCK_PROVIDER,
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
    item_description: 'Documents envelope',
    sender_name: 'Alex Morgan',
    sender_phone: '+1 555 0101',
    receiver_name: 'Jamie Lee',
    receiver_phone: '+1 555 0102',
    provider_id: status === BOOKING_STATUS.PENDING ? null : MOCK_PROVIDER.id,
    provider: status === BOOKING_STATUS.PENDING ? undefined : MOCK_PROVIDER,
    ...extra,
  };
}

/** Alpha-phase consumer bookings — canonical status flows for ride, food, parcel. */
export const ALPHA_CONSUMER_BOOKINGS: SnliftBooking[] = [
  // Ride: pending → accept → arrived → picked_up → in_transit → completed
  rideBooking(1001, BOOKING_STATUS.PENDING, daysAgo(0)),
  rideBooking(1002, BOOKING_STATUS.ACCEPTED, daysAgo(0)),
  rideBooking(1003, BOOKING_STATUS.ARRIVED, daysAgo(0)),
  rideBooking(1004, BOOKING_STATUS.PICKED_UP, daysAgo(0)),
  rideBooking(1005, BOOKING_STATUS.IN_TRANSIT, daysAgo(0)),
  // Food: accept → preparing → ready_for_pickup → picked_up → in_transit → completed
  foodBooking(2001, BOOKING_STATUS.ORDER_PLACED, daysAgo(0)),
  foodBooking(2002, BOOKING_STATUS.ACCEPTED, daysAgo(0)),
  foodBooking(2003, BOOKING_STATUS.PREPARING, daysAgo(0)),
  foodBooking(2004, BOOKING_STATUS.READY_FOR_PICKUP, daysAgo(0)),
  foodBooking(2005, BOOKING_STATUS.PICKED_UP, daysAgo(0)),
  foodBooking(2006, BOOKING_STATUS.IN_TRANSIT, daysAgo(0)),
  // Parcel: accept → arrived → ready_for_pickup → picked_up → in_transit → completed
  parcelBooking(3001, BOOKING_STATUS.PENDING, daysAgo(0)),
  parcelBooking(3002, BOOKING_STATUS.ACCEPTED, daysAgo(0)),
  parcelBooking(3003, BOOKING_STATUS.ARRIVED, daysAgo(0)),
  parcelBooking(3004, BOOKING_STATUS.READY_FOR_PICKUP, daysAgo(0)),
  parcelBooking(3005, BOOKING_STATUS.PICKED_UP, daysAgo(0)),
  parcelBooking(3006, BOOKING_STATUS.IN_TRANSIT, daysAgo(0)),
  // History
  rideBooking(1010, BOOKING_STATUS.COMPLETED, daysAgo(2), {
    completed_at: daysAgo(2),
    rating: { id: 1, rating: 5, review: null },
    customer_rating: 5,
  }),
  foodBooking(2010, BOOKING_STATUS.COMPLETED, daysAgo(3), { completed_at: daysAgo(3) }),
  parcelBooking(3010, BOOKING_STATUS.COMPLETED, daysAgo(5), { completed_at: daysAgo(5) }),
  rideBooking(1011, BOOKING_STATUS.CANCELLED, daysAgo(7), {
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
