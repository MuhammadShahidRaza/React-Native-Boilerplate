import type { Activity } from 'types/responseTypes';
import type { User } from 'types/responseTypes';
import type {
  SnliftBooking,
  SnliftWalletSummary,
  SnliftWalletTransaction,
} from 'types/snliftApi';
import { formatMoney } from 'utils/currency';

/** API often returns `{ user: {...} }` inside `data` — unwrap to the user object. */
export function unwrapApiUser(
  payload: unknown,
): Partial<User> & Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const obj = payload as Record<string, unknown>;
  if (obj.user && typeof obj.user === 'object') {
    return obj.user as Partial<User> & Record<string, unknown>;
  }
  return obj as Partial<User> & Record<string, unknown>;
}

/** First defined non-empty string from alias keys. */
export function pickString(
  raw: Record<string, unknown>,
  keys: string[],
  fallback = '',
): string {
  for (const key of keys) {
    const v = raw[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return fallback;
}

export function pickNumber(
  raw: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const v = raw[key];
    if (v === undefined || v === null || v === '') continue;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export function parseBalanceValue(raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

function pickFromDetailsFirst(raw: Record<string, unknown>, keys: string[]): string {
  const nested =
    raw.details && typeof raw.details === 'object'
      ? (raw.details as Record<string, unknown>)
      : {};
  return pickString(nested, keys) || pickString(raw, keys);
}

/** Read a field from normalized user.details only (not root). */
export function pickFromUserDetails(
  user: { details?: unknown } | null | undefined,
  keys: string[],
): string {
  const nested =
    user?.details && typeof user.details === 'object'
      ? (user.details as Record<string, unknown>)
      : {};
  return pickString(nested, keys);
}

/** Keep any 4-digit year; drop only invalid text or brand duplicates (e.g. year "Toyota"). */
export function sanitizeVehicleYear(
  year: string | undefined,
  brand?: string | undefined,
): string {
  if (!year?.trim()) return '';
  const value = year.trim();
  if (!/^\d{4}$/.test(value)) return '';
  if (brand && value.toLowerCase() === brand.trim().toLowerCase()) return '';
  return value;
}

function buildUserDetails(raw: Record<string, unknown>): User['details'] | undefined {
  const existing = raw.details as Record<string, unknown> | undefined;

  const merged: Record<string, unknown> = {
    ...(existing ?? {}),
    driving_license_front:
      pickFromDetailsFirst(raw, ['driver_license_front', 'driving_license_front']) || null,
    driving_license_back:
      pickFromDetailsFirst(raw, ['driver_license_back', 'driving_license_back']) || null,
    business_license_front:
      pickFromDetailsFirst(raw, ['mot_certificate', 'business_license_front']) || null,
    business_license_back:
      pickFromDetailsFirst(raw, ['business_license_back']) || null,
    driver_license_number:
      pickFromDetailsFirst(raw, ['driver_license_number', 'driving_license_number']) || null,
    driving_license_number:
      pickFromDetailsFirst(raw, ['driver_license_number', 'driving_license_number']) || null,
    driver_license_validity_date:
      pickFromDetailsFirst(raw, ['driver_license_validity_date', 'driver_license_validity_date', 'issue_date']) ||
      null,
    vehicle_brand: pickFromDetailsFirst(raw, ['vehicle_brand', 'vehicle_make']),
    vehicle_model: pickFromDetailsFirst(raw, ['vehicle_model', 'category']),
    vehicle_license_plate: pickFromDetailsFirst(raw, ['vehicle_license_plate', 'license_plate']),
    vehicle_year: (() => {
      const brand = pickFromDetailsFirst(raw, ['vehicle_brand', 'vehicle_make']);
      const yearRaw = pickFromDetailsFirst(raw, ['vehicle_year', 'year']);
      return sanitizeVehicleYear(yearRaw, brand) || null;
    })(),
    vehicle_color: pickFromDetailsFirst(raw, ['vehicle_color', 'color']),
    vehicle_type: pickFromDetailsFirst(raw, ['vehicle_type', 'type']),
  };

  const hasAny = Object.values(merged).some(v => v != null && v !== '');
  if (!hasAny) return undefined;

  if (existing && typeof existing === 'object') {
    return { ...(existing as User['details']), ...merged } as User['details'];
  }

  return {
    id: Number(raw.id) || 0,
    user_id: Number(raw.id) || 0,
    service_id: 0,
    experience: pickString(raw, ['experience']) || '0',
    radius: null,
    area: null,
    driving_license_number: (merged.driving_license_number as string | null) ?? null,
    social_security_number: null,
    driving_license_front: (merged.driving_license_front as string | null) ?? null,
    driving_license_back: (merged.driving_license_back as string | null) ?? null,
    business_license_front: (merged.business_license_front as string | null) ?? null,
    business_license_back: (merged.business_license_back as string | null) ?? null,
    insurance_document: null,
    created_at: pickString(raw, ['created_at']),
    updated_at: pickString(raw, ['updated_at']),
    latitude: null,
    longitude: null,
    city: pickString(raw, ['city']) || null,
    country: pickString(raw, ['country']) || null,
    state: pickString(raw, ['state']) || null,
    ...merged,
  } as User['details'];
}

/** User — maps API aliases (`total_cfa_balance`, `is_email_verified`, flat license fields, etc.). */
export function normalizeSniftUser(raw: Partial<User> & Record<string, unknown>): User {
  const balanceNum = pickNumber(raw, [
    'wallet_balance',
    'total_cfa_balance',
    'balance',
    'available_balance',
  ]);

  const totalEarnings = pickNumber(raw, ['total_earnings', 'upcoming_balance', 'earnings_total']);

  const emailVerified =
    pickString(raw, ['email_verified_at']) ||
    (typeof raw.is_email_verified === 'string' && raw.is_email_verified
      ? raw.is_email_verified
      : '') ||
    null;

  const token =
    pickString(raw, ['token', 'access_token', 'auth_token']) || (raw.token as string | undefined);

  const details = buildUserDetails(raw);
  const detailsRecord = (details ?? {}) as Record<string, unknown>;
  const brand = pickString(detailsRecord, ['vehicle_brand', 'vehicle_make']);
  const yearRaw = pickString(detailsRecord, ['vehicle_year', 'year']);
  const vehicleYear = sanitizeVehicleYear(yearRaw, brand) || yearRaw;

  return {
    ...(raw as User),
    token,
    token_type: pickString(raw, ['token_type', 'tokenType']) || raw.token_type || 'bearer',
    wallet_balance: balanceNum ?? raw.wallet_balance,
    balance: balanceNum ?? raw.balance,
    email_verified_at: emailVerified,
    user_type: (raw.user_type ?? raw.user_role ?? raw.user_type) as User['user_type'],
    user_role: (raw.user_role ?? raw.user_type) as User['user_role'],
    is_onboarded: raw.is_onboarded ?? (raw.status === 1 || raw.status === '1' ? 1 : 0),
    is_admin_verified: raw.is_admin_verified ?? 0,
    is_approved:
      raw.is_approved ??
      (typeof raw.status === 'number' ? raw.status : raw.is_approved ?? 1),
    notification_unread_count:
      pickNumber(raw, [
        'notification_unread_count',
        'notification_count',
        'unread_notifications_count',
      ]) ??
      raw.notification_unread_count ??
      raw.notification_count ??
      0,
    notification_count:
      pickNumber(raw, ['notification_count', 'notification_unread_count']) ??
      raw.notification_count,
    phone_number: pickString(raw, ['phone_number', 'phone']) || raw.phone_number,
    phone: pickString(raw, ['phone', 'phone_number']) || raw.phone,
    full_name:
      pickString(raw, ['full_name', 'name', 'display_name']) || (raw.full_name as string) || '',
    profile_image:
      pickString(raw, ['profile_image', 'avatar', 'image', 'photo']) ||
      raw.profile_image ||
      null,
    vehicle_brand: brand,
    vehicle_model: pickString(detailsRecord, ['vehicle_model', 'category']),
    vehicle_license_plate: pickString(detailsRecord, ['vehicle_license_plate', 'license_plate']),
    vehicle_year: vehicleYear,
    vehicle_color: pickString(detailsRecord, ['vehicle_color', 'color']),
    vehicle_type: pickString(detailsRecord, ['vehicle_type', 'type']),
    issue_date: pickString(detailsRecord, ['issue_date', 'driver_license_validity_date']),
    driver_license_validity_date: pickString(detailsRecord, [
      'driver_license_validity_date',
      'issue_date',
    ]),
    upcoming_balance: totalEarnings ?? raw.upcoming_balance,
    details,
  };
}

/** Unwrap `{ summary: { ... } }` or legacy flat wallet payload. */
export function unwrapWalletPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  if (r.summary && typeof r.summary === 'object' && !Array.isArray(r.summary)) {
    return r.summary as Record<string, unknown>;
  }
  return r;
}

/** Wallet summary — `today` / `week` / `month` / balance aliases. */
export function normalizeWalletSummary(raw: unknown): SnliftWalletSummary {
  const flat = unwrapWalletPayload(raw);
  const balance = pickNumber(flat, [
    'wallet_balance',
    'balance',
    'total_cfa_balance',
    'available_balance',
  ]);
  const base = flat as SnliftWalletSummary;
  const earnings = (keys: string[], fallback?: number | string) =>
    pickNumber(flat, keys) ?? (pickString(flat, keys) || fallback);

  return {
    ...base,
    wallet_balance: balance ?? base.wallet_balance,
    balance: balance ?? base.balance,
    total_cfa_balance: base.total_cfa_balance ?? balance ?? base.wallet_balance,
    total_earnings: earnings(['total_earnings', 'earnings_total', 'total'], base.total_earnings),
    today_earnings: earnings(['today_earnings', 'today', 'earnings_today'], base.today_earnings),
    week_earnings: earnings(['week_earnings', 'week', 'earnings_week', 'this_week'], base.week_earnings),
    month_earnings: earnings(
      ['month_earnings', 'month', 'earnings_month', 'this_month'],
      base.month_earnings,
    ),
  };
}

export type WalletTransactionUi = {
  id: string;
  name: string;
  type: string;
  amount: string;
};

/** Wallet transaction — `title`, `name`, `description`, `label`, amount formats. */
export function normalizeWalletTransaction(
  raw: SnliftWalletTransaction & Record<string, unknown>,
): WalletTransactionUi {
  const name = pickString(raw, [
    'name',
    'title',
    'label',
    'description',
    'transaction_title',
    'remark',
  ]);
  const type = pickString(raw, [
    'type',
    'booking_type',
    'module',
    'transaction_type',
    'category',
  ]);
  const amountRaw = raw.amount ?? raw.value ?? raw.total ?? raw.commission;
  return {
    id: String(raw.id ?? ''),
    name: name || 'Transaction',
    type: type || 'Booking',
    amount: formatMoney(amountRaw as string | number),
  };
}

/** Notification activity — `title`, `body`, read flags. */
export function normalizeActivity(raw: Record<string, unknown>): Activity {
  const viewed =
    raw.viewed ??
    raw.is_read ??
    raw.read ??
    (raw.is_viewed === true ? 1 : raw.is_viewed === false ? 0 : undefined) ??
    0;

  return {
    ...(raw as unknown as Activity),
    id: Number(raw.id) || 0,
    user_id: Number(raw.user_id) || 0,
    title: pickString(raw, ['title', 'name', 'subject', 'heading', 'notification_title']),
    body: pickString(raw, ['body', 'message', 'description', 'content', 'subtitle', 'text']),
    type: pickString(raw, ['type', 'notification_type', 'activity_type']),
    objectable_type: pickString(raw, ['objectable_type', 'object_type']),
    objectable_id: Number(raw.objectable_id ?? raw.object_id ?? 0),
    actor_id: Number(raw.actor_id ?? 0),
    viewed: typeof viewed === 'boolean' ? (viewed ? 1 : 0) : Number(viewed),
    status: Number(raw.status ?? 0),
    created_at: pickString(raw, ['created_at', 'date', 'sent_at']),
    updated_at: pickString(raw, ['updated_at']) || pickString(raw, ['created_at']),
    deleted_at: (raw.deleted_at as string | null) ?? null,
  };
}

export function normalizeActivitiesList(items: unknown[]): Activity[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => normalizeActivity((item ?? {}) as Record<string, unknown>));
}

function extractList<T>(res: unknown, keys: string[]): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  const r = res as Record<string, unknown>;
  for (const key of keys) {
    const v = r[key];
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

/** Paginated or wrapped list — `bookings`, `data`, `transactions`, etc. */
export function extractApiList<T>(res: unknown, keys: string[]): T[] {
  return extractList<T>(res, keys);
}

/** Booking — provider/customer/restaurant aliases on nested objects. */
export function normalizeSniftBooking(raw: SnliftBooking & Record<string, unknown>): SnliftBooking {
  const customerRaw = (raw.customer ?? {}) as Record<string, unknown>;
  const providerRaw = (raw.provider ?? {}) as Record<string, unknown>;
  const restaurantRaw = (raw.restaurant ?? {}) as Record<string, unknown>;

  const bookingType = pickString(raw, [
    'booking_type',
    'type',
    'service_type',
    'module',
    'order_type',
  ]) as SnliftBooking['booking_type'];

  return {
    ...raw,
    booking_type: bookingType || raw.booking_type,
    pickup_address:
      pickString(raw, ['pickup_address', 'pickup', 'from_address', 'origin_address']) ||
      raw.pickup_address,
    dropoff_address:
      pickString(raw, ['dropoff_address', 'dropoff', 'to_address', 'destination_address']) ||
      raw.dropoff_address,
    delivery_address:
      pickString(raw, ['delivery_address', 'dropoff_address', 'address']) || raw.delivery_address,
    status: pickString(raw, ['status', 'booking_status', 'state']) || raw.status,
    created_at: pickString(raw, ['created_at', 'createdAt']) || raw.created_at,
    customer: {
      ...raw.customer,
      full_name: pickString(customerRaw, ['full_name', 'name', 'title']),
      phone: pickString(customerRaw, ['phone', 'phone_number']),
      profile_image: pickString(customerRaw, ['profile_image', 'avatar', 'image']) || null,
    },
    provider: raw.provider
      ? {
          ...raw.provider,
          full_name: pickString(providerRaw, ['full_name', 'name', 'title']),
          phone: pickString(providerRaw, ['phone', 'phone_number']),
          profile_image: pickString(providerRaw, ['profile_image', 'avatar', 'image']) || null,
          vehicle_model: pickString(providerRaw, ['vehicle_model', 'model']),
          vehicle_license_plate: pickString(providerRaw, [
            'vehicle_license_plate',
            'license_plate',
            'plate',
          ]),
          vehicle_color: pickString(providerRaw, ['vehicle_color', 'color']),
          vehicle_type: pickString(providerRaw, ['vehicle_type', 'type']),
        }
      : raw.provider,
    restaurant: raw.restaurant
      ? {
          ...(raw.restaurant as object),
          name: pickString(restaurantRaw, ['name', 'title']),
          image: pickString(restaurantRaw, ['image', 'logo', 'photo']) || null,
        }
      : raw.restaurant,
    total_amount:
      raw.total_amount ?? raw.estimated_amount ?? raw.fare ?? raw.amount ?? raw.price,
    estimated_amount: raw.estimated_amount ?? raw.total_amount ?? raw.fare ?? raw.sub_total,
  };
}

export type SnliftContentPageNormalized = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  media: string | null;
};

/** CMS page — `title`, `name`, `body`, `content`, `media` aliases. */
export function normalizeContentPage(raw: Record<string, unknown>): SnliftContentPageNormalized {
  return {
    id: Number(raw.id) || undefined,
    name: pickString(raw, ['name', 'title', 'page_title', 'heading']),
    slug: pickString(raw, ['slug', 'key', 'page_slug']),
    description: pickString(raw, ['description', 'body', 'content', 'html', 'text']),
    media: pickString(raw, ['media', 'image', 'banner', 'thumbnail']) || null,
  };
}
