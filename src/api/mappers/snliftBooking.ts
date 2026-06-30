import { normalizeSniftBooking } from 'api/normalizers/snlift';
import { isSengoBrand } from 'constants/assets';
import type {
  WorkerRequestDetail,
  WorkerRequestRecord,
  WorkerServiceType,
  WorkerTripRecord,
} from 'components/common/worker/workerMockData';
import type { SnliftBooking, SnliftBookingStatus } from 'types/snliftApi';
import { formatMoney, parseMoneyAmount } from 'utils/currency';
import { formatDistanceKm } from 'utils/distance';
import { parseMapCoord } from 'utils/coordinateAlongPolyline';
import { COLORS } from 'utils/colors';
import { getBookingStatusLabel, isActiveBookingStatus as isBookingActive } from 'utils/bookingStatuses';

export { getBookingStatusLabel } from 'utils/bookingStatuses';

const BOOKING_PAYMENT_METHOD = isSengoBrand() ? 'Card' : 'Cash';

export type ConsumerFoodOrderLine = {
  key: string;
  label: string;
  quantity: number;
  unitPrice?: string;
  lineTotal?: string;
};

export type FoodOrderSummary = {
  subTotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
};

/** Subtotal / delivery / discount / total — derives delivery fee when API omits it. */
export function resolveFoodOrderSummary(booking: SnliftBooking): FoodOrderSummary | null {
  if (booking.booking_type !== 'food') return null;

  const discountAmount = parseMoneyAmount(booking.discount_amount) ?? 0;
  const totalAmount = parseMoneyAmount(booking.total_amount ?? booking.estimated_amount);
  let subTotal = parseMoneyAmount(booking.sub_total);

  if (subTotal == null) {
    const fromLines = (booking.bookingDetails ?? []).reduce((sum, item) => {
      const lineTotal = parseMoneyAmount(item.total_price);
      if (lineTotal != null) return sum + lineTotal;
      const unit = parseMoneyAmount(item.unit_price);
      const qty = item.quantity ?? 1;
      return unit != null ? sum + unit * qty : sum;
    }, 0);
    if (fromLines > 0) subTotal = fromLines;
  }

  if (subTotal == null && totalAmount == null) return null;

  const resolvedSubTotal = subTotal ?? totalAmount ?? 0;
  const resolvedTotal = totalAmount ?? resolvedSubTotal;
  let deliveryFee = parseMoneyAmount(booking.delivery_fee);

  if (deliveryFee == null) {
    deliveryFee = Math.max(0, resolvedTotal - resolvedSubTotal + discountAmount);
  }

  return {
    subTotal: resolvedSubTotal,
    deliveryFee,
    discountAmount,
    totalAmount: resolvedTotal,
  };
}

/** Food line items — prefers API `bookingDetails`, falls back to `items`. */
export function resolveFoodOrderLines(booking: SnliftBooking): ConsumerFoodOrderLine[] {
  const details = booking.bookingDetails ?? [];
  if (details.length > 0) {
    return details.map((item, index) => ({
      key: String(item.id ?? item.menu_item_id ?? index),
      label:
        item.item_name ??
        item.menuItem?.name ??
        item.menuItem?.title ??
        `Item #${item.menu_item_id ?? index + 1}`,
      quantity: item.quantity ?? 1,
      unitPrice: item.unit_price != null ? formatMoney(item.unit_price) : undefined,
      lineTotal: item.total_price != null ? formatMoney(item.total_price) : undefined,
    }));
  }

  const items = booking.items ?? [];
  return items.map((item, index) => {
    const qty = item.quantity ?? 1;
    const label = item.name ?? item.title ?? `Item #${item.menu_item_id ?? index + 1}`;
    const unitPrice =
      typeof item.price === 'number' ? item.price : parseFloat(String(item.price ?? ''));
    const lineTotalRaw = item.total_price ?? (Number.isFinite(unitPrice) ? unitPrice * qty : null);
    return {
      key: `${item.menu_item_id ?? index}-${label}`,
      label,
      quantity: qty,
      unitPrice: Number.isFinite(unitPrice) ? formatMoney(unitPrice) : undefined,
      lineTotal: lineTotalRaw != null ? formatMoney(lineTotalRaw) : undefined,
    };
  });
}

export type ConsumerActivityItem = {
  id: string;
  bookingType: SnliftBooking['booking_type'];
  rawStatus: string;
  serviceLabel: 'Ride' | 'Food' | 'Parcel';
  isoDate: string;
  price: string;
  status: string;
  pickupTitle: string;
  pickupAddr: string;
  dropTitle: string;
  dropAddr: string;
};

function bookingTypeToService(type: string | undefined): WorkerServiceType {
  if (type === 'food') return 'food';
  if (type === 'ride') return 'ride';
  return 'parcel';
}

export function mapBookingToWorkerRequest(booking: SnliftBooking): WorkerRequestRecord {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  return {
    id: String(b.id),
    customerName: b.customer?.full_name ?? 'Customer',
    fare: formatMoney(b.total_amount ?? b.estimated_amount),
    serviceType: bookingTypeToService(b.booking_type),
  };
}

function statusLabel(status: SnliftBookingStatus | undefined): string {
  return getBookingStatusLabel(status);
}

function formatDate(d: string | null | undefined): string {
  if (!d) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB').replace(/\//g, '-');
}

function shortPlaceName(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return 'Destination';
  return trimmed.split(',')[0]?.trim() || trimmed;
}

function formatCustomerRating(customer: SnliftBooking['customer']): string {
  const raw = customer as Record<string, unknown> | undefined;
  const value = raw?.average_rating ?? raw?.avg_rating ?? raw?.rating;
  if (value === undefined || value === null || value === '') return '—';
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(n) ? '—' : n.toFixed(1);
}

function estimateEtaMinutes(distanceKm: number | string | null | undefined): string {
  const n = typeof distanceKm === 'number' ? distanceKm : parseFloat(String(distanceKm ?? ''));
  if (Number.isNaN(n) || n <= 0) return '—';
  return `${Math.max(1, Math.ceil(n * 2.5))} min`;
}


const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: COLORS.APP_PRIMARY,
  arrived: COLORS.APP_PRIMARY,
  preparing: COLORS.APP_PRIMARY,
  ready_for_pickup: COLORS.APP_SECONDARY,
  picked_up: COLORS.APP_SECONDARY,
  in_transit: COLORS.APP_SECONDARY,
  completed: '#16A34A',
  complete: '#16A34A',
  delivered: '#16A34A',
  finished: '#16A34A',
  cancelled: COLORS.RED,
};

export function getBookingStatusColor(status: SnliftBookingStatus | string | undefined): string {
  const s = (status ?? 'pending').toLowerCase();
  return STATUS_COLORS[s] ?? COLORS.APP_PRIMARY;
}

export function mapBookingToActivityItem(booking: SnliftBooking): ConsumerActivityItem {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const serviceLabel =
    b.booking_type === 'food' ? 'Food' : b.booking_type === 'parcel' ? 'Parcel' : 'Ride';
  const pickupAddr = b.pickup_address ?? b.restaurant?.name ?? 'Pickup';
  const dropAddr = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';
  return {
    id: String(b.id),
    bookingType: b.booking_type ?? 'ride',
    rawStatus: (b.status ?? 'pending').toLowerCase(),
    serviceLabel,
    isoDate: b.created_at ?? b.completed_at ?? new Date().toISOString(),
    price: formatMoney(b.total_amount ?? b.estimated_amount ?? b.fare),
    status: statusLabel(b.status),
    pickupTitle: serviceLabel === 'Food' ? (b.restaurant?.name ?? 'Restaurant') : 'Pickup',
    pickupAddr,
    dropTitle: 'Destination',
    dropAddr,
  };
}

export function mapBookingToWorkerTrip(booking: SnliftBooking): WorkerTripRecord {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const pickup = b.pickup_address ?? 'Pickup';
  const drop = b.dropoff_address ?? b.delivery_address ?? 'Destination';
  const km = formatDistanceKm(b.distance_km);
  return {
    id: String(b.id),
    status: (b.status ?? 'pending').toLowerCase(),
    statusLabel: statusLabel(b.status),
    date: formatDate(b.completed_at ?? b.created_at),
    earned: formatMoney(b.total_amount ?? b.estimated_amount),
    pickupLabel: `Pickup: ${pickup.slice(0, 28)}`,
    pickupAddress: pickup,
    destinationLabel: `Destination: ${drop.slice(0, 28)}`,
    destinationAddress: drop,
    distance: km,
    rating: formatCustomerRating(b.customer),
    payment: BOOKING_PAYMENT_METHOD,
  };
}

export function mapBookingToWorkerRequestDetail(booking: SnliftBooking): WorkerRequestDetail {
  const base = mapBookingToWorkerRequest(booking);
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const pickup = b.pickup_address ?? 'Pickup';
  const drop = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';

  const baseFareNum =
    parseMoneyAmount(b.base_fare) ??
    parseMoneyAmount(b.total_amount) ??
    parseMoneyAmount(b.estimated_amount) ??
    0;
  const commissionNum =
    parseMoneyAmount(b.commission) ?? parseMoneyAmount(b.commission_amount) ?? 0;
  const commissionPct = parseMoneyAmount(b.commission_percentage);
  const earnedNum = Math.max(0, baseFareNum - commissionNum);
  const prevWallet = parseMoneyAmount(b.wallet_prev_balance);
  const newWallet = parseMoneyAmount(b.wallet_new_balance);

  return {
    ...base,
    customerId: b.customer?.id ?? b.customer_id,
    customerPhone: b.customer?.phone ?? undefined,
    customerAvatar: b.customer?.profile_image ?? null,
    customerRating: formatCustomerRating(b.customer),
    senderName: b.sender_name || base.customerName,
    senderPhone: b.sender_phone || b.customer?.phone || undefined,
    receiverName: b.receiver_name || undefined,
    receiverPhone: b.receiver_phone || undefined,
    pickupAddress: pickup,
    pickupShortName: shortPlaceName(pickup),
    dropoffAddress: drop,
    dropoffShortName: shortPlaceName(drop),
    distance: formatDistanceKm(b.distance_km),
    eta: estimateEtaMinutes(b.distance_km),
    payment: BOOKING_PAYMENT_METHOD,
    baseFare: formatMoney(baseFareNum),
    commission: formatMoney(commissionNum > 0 ? -commissionNum : 0),
    commissionPercentage: commissionPct != null && commissionPct > 0 ? commissionPct : undefined,
    earned: formatMoney(earnedNum),
    previousWallet: formatMoney(prevWallet ?? 0),
    newWallet: formatMoney(newWallet ?? 0),
    pickupLat: parseMapCoord(b.pickup_latitude) ?? 0,
    pickupLng: parseMapCoord(b.pickup_longitude) ?? 0,
    dropoffLat: parseMapCoord(b.dropoff_latitude) ?? 0,
    dropoffLng: parseMapCoord(b.dropoff_longitude) ?? 0,
  };
}

export function isActiveBookingStatus(status: SnliftBookingStatus | undefined): boolean {
  return isBookingActive(status);
}

/** Worker ride history — completed/delivered jobs (API status aliases). */
export function isCompletedBookingStatus(status: SnliftBookingStatus | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'completed' || s === 'complete' || s === 'delivered' || s === 'finished';
}
