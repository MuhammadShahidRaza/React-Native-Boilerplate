import { API_ROUTES } from 'api/routes';
import { extractApiList, pickString } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';
import type { SnliftRestaurant } from 'types/snliftApi';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaRestaurantMenu } from 'constants/alphaBookingMocks';
import { FOOD_RESTAURANTS } from 'components/common/food/foodRestaurants';
import { IMAGES } from 'constants/assets';
import type { RestaurantItem } from 'components/common/food/foodRestaurants';
import { formatMoney } from 'utils/currency';

export type SnliftMenuCategory = {
  id?: number;
  title?: string;
};

export type SnliftMenuItem = {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  image?: string | null;
  is_available?: number | boolean;
  is_popular?: number | boolean;
  category?: SnliftMenuCategory | string;
  category_id?: number;
};

export type SnliftMenuPage = {
  menu_items?: SnliftMenuItem[];
  current_page?: number;
  last_page?: number;
};

function isMenuItemAvailable(item: SnliftMenuItem): boolean {
  return item.is_available !== false && item.is_available !== 0;
}

export function isMenuItemPopular(item: SnliftMenuItem): boolean {
  return item.is_popular === true || item.is_popular === 1;
}

export function extractMenuCategoryTitle(item: SnliftMenuItem): string {
  const category = item.category;
  if (category && typeof category === 'object') {
    return category.title?.trim() ?? '';
  }
  if (typeof category === 'string') return category.trim();
  return '';
}

export async function getRestaurantMenu(
  restaurantId: number | string,
  params?: { page?: number },
  options?: { showLoader?: boolean },
) {
  const raw = await handleGetApiRequest<SnliftMenuItem[] | SnliftMenuPage>({
    url: API_ROUTES.RESTAURANT_MENU(restaurantId),
    params: params as Record<string, number> | undefined,
    showError: false,
    showLoader: options?.showLoader ?? false,
  });
  if (!raw) return [];
  return extractApiList<SnliftMenuItem>(raw, ['menu_items', 'menu', 'items', 'data']);
}

/** Fetch all paginated menu pages for a restaurant. */
export async function getRestaurantMenuAll(
  restaurantId: number | string,
  options?: { showLoader?: boolean },
): Promise<SnliftMenuItem[]> {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return getAlphaRestaurantMenu(restaurantId);
  }
  const items: SnliftMenuItem[] = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage) {
    const raw = await handleGetApiRequest<SnliftMenuItem[] | SnliftMenuPage>({
      url: API_ROUTES.RESTAURANT_MENU(restaurantId),
      params: { page },
      showError: page === 1,
      showLoader: options?.showLoader === true && page === 1,
    });
    if (!raw) break;

    const pageItems = extractApiList<SnliftMenuItem>(raw, ['menu_items', 'menu', 'items', 'data']);
    items.push(...pageItems.filter(isMenuItemAvailable));

    const last = (raw as SnliftMenuPage).last_page;
    lastPage = typeof last === 'number' && last > 0 ? last : 1;
    page += 1;
  }

  return items;
}

export async function listRestaurants(
  params?: { latitude?: number; longitude?: number },
  options?: { showLoader?: boolean },
) {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return FOOD_RESTAURANTS.map(r => ({
      id: Number(r.id),
      name: r.name,
      cuisine: r.cuisine,
      delivery_fee: parseFloat((r.fee ?? '').replace(/[^0-9.]/g, '')) || 30,
      is_featured: r.featured,
    }));
  }
  return handleGetApiRequest<SnliftRestaurant[] | { restaurants: SnliftRestaurant[] }>({
    url: API_ROUTES.RESTAURANTS,
    showError: false,
    showLoader: options?.showLoader ?? false,
    params: params as Record<string, number> | undefined,
  });
}

export function extractRestaurants(
  res: SnliftRestaurant[] | { restaurants: SnliftRestaurant[] } | undefined,
): SnliftRestaurant[] {
  return extractApiList<SnliftRestaurant>(res, ['restaurants', 'data', 'items']);
}

function extractCategoryLabels(raw: Record<string, unknown>): string[] {
  const categories = raw.categories;
  if (!Array.isArray(categories)) return [];
  return categories
    .map(entry => {
      const row = entry as Record<string, unknown>;
      const nested =
        row.category && typeof row.category === 'object'
          ? (row.category as Record<string, unknown>)
          : row;
      return pickString(nested, ['title', 'name']);
    })
    .filter(Boolean);
}

function formatMinutesDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr`;
  return `${mins} min`;
}

/** Backend duration — `00:30:00`, minutes, or preformatted label → `30 min`. */
export function formatRestaurantEstimatedTime(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined;

  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return formatMinutesDuration(Math.round(raw));
  }

  const str = String(raw).trim();
  if (!str) return undefined;

  const segments = str.split(':');
  if (segments.length >= 2 && segments.every(s => /^\d+$/.test(s))) {
    const hours = parseInt(segments[0], 10) || 0;
    const minutes = parseInt(segments[1], 10) || 0;
    const seconds = segments.length >= 3 ? parseInt(segments[2], 10) || 0 : 0;
    const totalMinutes = hours * 60 + minutes + (seconds >= 30 ? 1 : 0);
    if (totalMinutes <= 0) return undefined;
    return formatMinutesDuration(totalMinutes);
  }

  const asNum = parseInt(str, 10);
  if (!Number.isNaN(asNum) && String(asNum) === str && asNum > 0) {
    return formatMinutesDuration(asNum);
  }

  return str;
}

export function mapApiRestaurantToItem(r: SnliftRestaurant): RestaurantItem {
  const raw = r as SnliftRestaurant & Record<string, unknown>;
  const name = pickString(raw, ['title', 'name', 'restaurant_name']) || 'Restaurant';
  const categoryLabels = extractCategoryLabels(raw);

  const cuisine =
    categoryLabels.join(' · ') ||
    pickString(raw, ['location', 'address', 'street']) ||
    pickString(raw, ['city', 'cuisine', 'description']) ||
    '';

  const time = formatRestaurantEstimatedTime(raw.estimated_time ?? raw.delivery_time);

  const feeRaw = raw.delivery_fee;
  const feeNum =
    typeof feeRaw === 'number' ? feeRaw : parseFloat(String(feeRaw ?? '').replace(/[^0-9.-]/g, ''));
  const fee = Number.isFinite(feeNum) && feeNum >= 0 ? formatMoney(feeNum) : undefined;

  const distanceRaw = raw.distance_km;
  const distanceNum =
    typeof distanceRaw === 'number'
      ? distanceRaw
      : parseFloat(String(distanceRaw ?? '').replace(/[^0-9.-]/g, ''));
  const distanceKm = Number.isFinite(distanceNum) ? distanceNum : undefined;
  const distanceLabel = distanceKm != null ? `${distanceKm.toFixed(1)} km away` : undefined;

  const ratingRaw = raw.average_rating ?? raw.rating;
  const ratingNum =
    typeof ratingRaw === 'number'
      ? ratingRaw
      : parseFloat(String(ratingRaw ?? '').replace(/[^0-9.-]/g, ''));
  const rating = Number.isFinite(ratingNum) && ratingNum > 0 ? ratingNum.toFixed(1) : undefined;

  const logo = pickString(raw, ['logo', 'image', 'photo', 'thumbnail', 'cover_image']);

  return {
    id: String(r.id),
    name,
    cuisine,
    categoryLabels,
    time,
    fee,
    distanceKm,
    distanceLabel,
    rating,
    featured: Boolean(r.is_featured ?? raw.is_approved ?? raw.featured),
    image: logo ? { uri: logo } : IMAGES.RESTAURANT_ONE,
  };
}
