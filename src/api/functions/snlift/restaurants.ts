import { API_ROUTES } from 'api/routes';
import { extractApiList, pickString } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';
import type { SnliftRestaurant } from 'types/snliftApi';
import { IMAGES } from 'constants/assets';
import type { RestaurantItem, FoodTag } from 'components/common/food/foodRestaurants';
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

export function mapApiRestaurantToItem(r: SnliftRestaurant): RestaurantItem {
  const raw = r as SnliftRestaurant & Record<string, unknown>;
  const name = pickString(raw, ['name', 'title', 'restaurant_name']) || 'Restaurant';
  const cuisine = pickString(raw, ['cuisine', 'description', 'category', 'subtitle']) || '';
  const tags: FoodTag[] = [];
  const apiTags = raw.tags;
  if (Array.isArray(apiTags)) {
    for (const t of apiTags) {
      const s = String(t).trim();
      if (!s) continue;
      const normalized =
        s.toLowerCase() === 'burgers' ? 'Burgers'
        : s.toLowerCase() === 'pizza' ? 'Pizza'
        : s.toLowerCase() === 'chinese' ? 'Chinese'
        : null;
      if (normalized && !tags.includes(normalized)) tags.push(normalized);
    }
  }
  const lower = `${name} ${cuisine}`.toLowerCase();
  if (tags.length === 0) {
    if (lower.includes('burger')) tags.push('Burgers');
    if (lower.includes('pizza')) tags.push('Pizza');
    if (lower.includes('chinese') || lower.includes('noodle')) tags.push('Chinese');
    if (tags.length === 0) tags.push('Burgers');
  }

  const feeNum =
    typeof r.delivery_fee === 'number' ? r.delivery_fee : parseFloat(String(r.delivery_fee ?? '30'));
  const fee = formatMoney(Number.isNaN(feeNum) ? 30 : feeNum);

  return {
    id: String(r.id),
    name,
    cuisine: cuisine || 'Restaurant',
    tags,
    time: pickString(raw, ['delivery_time', 'time', 'eta', 'duration']) || '15-25 min',
    fee,
    featured: Boolean(r.is_featured ?? raw.featured),
    image:
      pickString(raw, ['image', 'logo', 'photo', 'thumbnail', 'cover_image']) ?
        { uri: pickString(raw, ['image', 'logo', 'photo', 'thumbnail', 'cover_image']) }
      : IMAGES.RESTAURANT_ONE,
  };
}
