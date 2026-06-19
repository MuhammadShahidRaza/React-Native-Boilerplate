import { INITIAL_REGION } from 'constants/common';
import type { SnliftMenuItem } from 'api/functions/snlift/restaurants';
import type {
  CreateFoodBookingPayload,
  CreateParcelBookingPayload,
  CreateRideBookingPayload,
  EstimateBookingPayload,
  EstimateBookingResult,
  EstimateCategoryResult,
} from 'api/functions/snlift/bookings';
import { getAlphaConsumerBookingById } from 'constants/consumerBookingMock';
import { BOOKING_STATUS, normalizeBookingStatus } from 'utils/bookingStatuses';
import { haversineDistanceKmExact } from 'utils/distance';
import type { SnliftBooking } from 'types/snliftApi';

const LAT = INITIAL_REGION.latitude;
const LNG = INITIAL_REGION.longitude;

let alphaNextBookingId = 90_000;
const alphaSessionBookings = new Map<number, SnliftBooking>();
const alphaBookingRatings = new Map<number, { rating: number; comment?: string }>();

function applyStoredRating(booking: SnliftBooking): SnliftBooking {
  const stored = alphaBookingRatings.get(booking.id);
  if (!stored) return booking;
  return {
    ...booking,
    customer_rating: stored.rating,
    review_comment: stored.comment,
    review: { rating: stored.rating, comment: stored.comment },
    rating: {
      id: booking.id,
      rating: stored.rating,
      review: stored.comment ?? null,
    },
  };
}

const MOCK_PROVIDER = {
  id: 101,
  full_name: 'John Doe',
  phone: '+01000000000',
  vehicle_model: 'Toyota Corolla',
  vehicle_color: 'Black',
  vehicle_license_plate: 'AA-001-AA',
  vehicle_type: 'Car',
};

function withMockProvider(booking: SnliftBooking): SnliftBooking {
  return {
    ...booking,
    provider_id: MOCK_PROVIDER.id,
    provider: MOCK_PROVIDER,
  };
}

const RESTAURANT_NAMES: Record<string, string> = {
  '1': 'Retro Burger',
  '2': 'The Grill House',
  '3': 'Noodle Bar',
  '4': 'Slice Heaven',
};

const ALPHA_MENU_BY_RESTAURANT: Record<string, SnliftMenuItem[]> = {
  '1': [
    { id: 1001, name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, house sauce', price: 450, is_popular: 1 },
    { id: 1002, name: 'Cheese Burger', description: 'Double cheese, pickles, special mayo', price: 520, is_popular: 1 },
    { id: 1003, name: 'Crispy Fries', description: 'Golden fries with seasoning', price: 180 },
    { id: 1004, name: 'Chocolate Shake', description: 'Thick chocolate milkshake', price: 220 },
  ],
  '2': [
    { id: 2001, name: 'BBQ Platter', description: 'Grilled chicken with sides', price: 890, is_popular: 1 },
    { id: 2002, name: 'Steak Sandwich', description: 'Tender steak in brioche bun', price: 750 },
    { id: 2003, name: 'Margherita Pizza', description: 'Fresh mozzarella and basil', price: 680, is_popular: 1 },
  ],
  '3': [
    { id: 3001, name: 'Chicken Chow Mein', description: 'Stir-fried noodles with vegetables', price: 420, is_popular: 1 },
    { id: 3002, name: 'Spring Rolls', description: 'Crispy vegetable rolls (4 pcs)', price: 250 },
    { id: 3003, name: 'Sweet & Sour Chicken', description: 'Classic Chinese favourite', price: 550 },
  ],
  '4': [
    { id: 4001, name: 'Pepperoni Pizza', description: 'Large 12" pepperoni pizza', price: 720, is_popular: 1 },
    { id: 4002, name: 'Veggie Supreme', description: 'Loaded vegetable pizza', price: 650 },
    { id: 4003, name: 'Garlic Bread', description: 'Cheesy garlic bread sticks', price: 280 },
  ],
};

function resolveDistanceKm(data: EstimateBookingPayload): number {
  if (
    data.pickup_latitude != null &&
    data.pickup_longitude != null &&
    data.dropoff_latitude != null &&
    data.dropoff_longitude != null
  ) {
    return Math.max(
      0.5,
      Math.round(
        haversineDistanceKmExact(
          data.pickup_latitude,
          data.pickup_longitude,
          data.dropoff_latitude,
          data.dropoff_longitude,
        ) * 10,
      ) / 10,
    );
  }
  if (data.delivery_latitude != null && data.delivery_longitude != null) {
    return 3.8;
  }
  return 4.2;
}

function rideCategoryEstimate(category: string, distanceKm: number): EstimateCategoryResult {
  const multipliers: Record<string, number> = { standard: 1, comfort: 1.25, business: 1.55 };
  const mult = multipliers[category] ?? 1;
  const base = Math.round((120 + distanceKm * 28) * mult);
  return {
    ride_category: category,
    base_fare: base,
    price_per_km: Math.round(28 * mult),
    estimated_amount: base,
    discount_amount: 0,
    total_amount: base,
    promo_code: null,
    promo_valid: null,
    promo_applied: false,
  };
}

export function alphaEstimateBooking(data: EstimateBookingPayload): EstimateBookingResult {
  const distance_km = resolveDistanceKm(data);

  if (data.booking_type === 'ride') {
    const categories = ['standard', 'comfort', 'business'].map(cat =>
      rideCategoryEstimate(cat, distance_km),
    );
    return { booking_type: 'ride', distance_km, categories };
  }

  if (data.booking_type === 'food') {
    const subTotal =
      data.items?.reduce((sum, item) => sum + item.quantity * 350, 0) ?? 850;
    const deliveryFee = 50;
    const total = subTotal + deliveryFee;
    return {
      booking_type: 'food',
      distance_km,
      sub_total: subTotal,
      delivery_fee: deliveryFee,
      discount_amount: 0,
      total_amount: total,
      estimated_amount: total,
    };
  }

  const base = Math.round(180 + distance_km * 32);
  return {
    booking_type: 'parcel',
    distance_km,
    base_fare: base,
    sub_total: base,
    estimated_amount: base,
    discount_amount: 0,
    total_amount: base,
  };
}

function storeAlphaBooking(booking: SnliftBooking): SnliftBooking {
  alphaSessionBookings.set(booking.id, booking);
  return booking;
}

/** Register or replace a booking in the alpha session store (worker mocks, consumer creates). */
export function registerAlphaSessionBooking(booking: SnliftBooking): SnliftBooking {
  return storeAlphaBooking(booking);
}

export function getAlphaBookingById(id: number | string): SnliftBooking | undefined {
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(numericId)) return undefined;
  const booking =
    alphaSessionBookings.get(numericId) ?? getAlphaConsumerBookingById(numericId);
  return booking ? applyStoredRating(booking) : undefined;
}

export function setAlphaBookingRating(
  id: number | string,
  rating: number,
  comment?: string,
): void {
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(numericId)) return;
  alphaBookingRatings.set(numericId, { rating, comment });
  const session = alphaSessionBookings.get(numericId);
  if (session) {
    storeAlphaBooking({
      ...session,
      customer_rating: rating,
      review_comment: comment,
      review: { rating, comment },
      rating: {
        id: numericId,
        rating,
        review: comment ?? null,
      },
    });
  }
}

export function removeAlphaSessionBooking(id: number | string): void {
  const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (!Number.isNaN(numericId)) alphaSessionBookings.delete(numericId);
}

function alphaStatusNeedsProvider(booking: SnliftBooking): boolean {
  const s = normalizeBookingStatus(booking.status);
  if (s === BOOKING_STATUS.PENDING || s === BOOKING_STATUS.CANCELLED) return false;
  if (booking.booking_type === 'food') {
    return (
      s === BOOKING_STATUS.READY_FOR_PICKUP ||
      s === BOOKING_STATUS.PICKED_UP ||
      s === BOOKING_STATUS.IN_TRANSIT ||
      s === BOOKING_STATUS.COMPLETED
    );
  }
  return true;
}

export function updateAlphaSessionBookingStatus(id: number | string, status: string): SnliftBooking | null {
  const booking = getAlphaBookingById(id);
  if (!booking) return null;
  let updated: SnliftBooking = {
    ...booking,
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === BOOKING_STATUS.COMPLETED) {
    updated.completed_at = new Date().toISOString();
  }
  if (alphaStatusNeedsProvider(updated)) {
    updated = withMockProvider(updated);
  }
  return storeAlphaBooking(updated);
}

export function alphaCreateRideBooking(data: CreateRideBookingPayload): { booking: SnliftBooking } {
  const cat = data.ride_category || 'standard';
  const est = rideCategoryEstimate(cat, data.distance_km);
  const id = alphaNextBookingId++;
  return {
    booking: storeAlphaBooking({
      id,
      booking_type: 'ride',
      ride_category: cat,
      status: BOOKING_STATUS.PENDING,
      created_at: new Date().toISOString(),
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      pickup_latitude: data.pickup_latitude,
      pickup_longitude: data.pickup_longitude,
      dropoff_latitude: data.dropoff_latitude,
      dropoff_longitude: data.dropoff_longitude,
      distance_km: data.distance_km,
      total_amount: est.total_amount,
      estimated_amount: est.estimated_amount,
    }),
  };
}

export function alphaCreateFoodBooking(data: CreateFoodBookingPayload): { booking: SnliftBooking } {
  const est = alphaEstimateBooking({
    booking_type: 'food',
    restaurant_id: data.restaurant_id,
    delivery_latitude: data.delivery_latitude,
    delivery_longitude: data.delivery_longitude,
    items: data.items,
  });
  const id = alphaNextBookingId++;
  const restaurantName = RESTAURANT_NAMES[String(data.restaurant_id)] ?? 'Restaurant';
  return {
    booking: storeAlphaBooking({
      id,
      booking_type: 'food',
      status: BOOKING_STATUS.ORDER_PLACED,
      created_at: new Date().toISOString(),
      restaurant_id: data.restaurant_id,
      restaurant: { id: data.restaurant_id, name: restaurantName },
      pickup_address: restaurantName,
      delivery_address: data.delivery_address,
      dropoff_address: data.delivery_address,
      pickup_latitude: LAT + 0.006,
      pickup_longitude: LNG - 0.004,
      dropoff_latitude: data.delivery_latitude ?? LAT - 0.005,
      dropoff_longitude: data.delivery_longitude ?? LNG + 0.006,
      distance_km: est.distance_km ?? 3.8,
      sub_total: est.sub_total,
      delivery_fee: est.delivery_fee,
      total_amount: est.total_amount,
      estimated_amount: est.estimated_amount,
      items: data.items,
    }),
  };
}

export function alphaCreateParcelBooking(data: CreateParcelBookingPayload): { booking: SnliftBooking } {
  const total = data.total_amount ?? data.estimated_amount ?? alphaEstimateBooking({
    booking_type: 'parcel',
    pickup_latitude: data.pickup_latitude,
    pickup_longitude: data.pickup_longitude,
    dropoff_latitude: data.dropoff_latitude,
    dropoff_longitude: data.dropoff_longitude,
  }).total_amount;
  const id = alphaNextBookingId++;
  return {
    booking: storeAlphaBooking({
      id,
      booking_type: 'parcel',
      status: BOOKING_STATUS.PENDING,
      created_at: new Date().toISOString(),
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      pickup_latitude: data.pickup_latitude,
      pickup_longitude: data.pickup_longitude,
      dropoff_latitude: data.dropoff_latitude,
      dropoff_longitude: data.dropoff_longitude,
      distance_km: data.distance_km,
      total_amount: total,
      estimated_amount: total,
      item_description: data.item_description,
      sender_name: data.sender_name,
      sender_phone: data.sender_phone,
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
    }),
  };
}

export function alphaAcceptBooking(id: number | string): { booking: SnliftBooking } | null {
  const existing = getAlphaBookingById(id);
  if (!existing) return null;
  return {
    booking: storeAlphaBooking(
      withMockProvider({ ...existing, status: BOOKING_STATUS.ACCEPTED }),
    ),
  };
}

export function getAlphaSessionBookings(): SnliftBooking[] {
  return Array.from(alphaSessionBookings.values()).sort((a, b) => {
    const aTime = Date.parse(a.created_at ?? '') || 0;
    const bTime = Date.parse(b.created_at ?? '') || 0;
    return bTime - aTime;
  });
}

export function getAlphaRestaurantMenu(restaurantId: number | string): SnliftMenuItem[] {
  const key = String(restaurantId);
  return ALPHA_MENU_BY_RESTAURANT[key] ?? ALPHA_MENU_BY_RESTAURANT['1'];
}
