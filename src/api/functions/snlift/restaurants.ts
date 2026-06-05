import { API_ROUTES } from 'api/routes';
import { extractApiList, pickString } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';
import type { SnliftRestaurant } from 'types/snliftApi';
import { IMAGES } from 'constants/assets';
import type { RestaurantItem, FoodTag } from 'components/common/food/foodRestaurants';

export type SnliftMenuItem = {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  image?: string | null;
  is_available?: number | boolean;
  is_popular?: number | boolean;
  category?: string;
};

export async function getRestaurantMenu(
  restaurantId: number | string,
  params?: { page?: number },
) {
  const raw = await handleGetApiRequest<
    SnliftMenuItem[] | { menu: SnliftMenuItem[]; data: SnliftMenuItem[] }
  >({
    url: API_ROUTES.RESTAURANT_MENU(restaurantId),
    params: params as Record<string, number> | undefined,
    showError: false,
  });
  if (!raw) return [];
  return extractApiList<SnliftMenuItem>(raw, ['menu', 'data', 'items']);
}

export async function listRestaurants() {
  return handleGetApiRequest<SnliftRestaurant[] | { restaurants: SnliftRestaurant[] }>({
    url: API_ROUTES.RESTAURANTS,
    showError: false,
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
  const fee = Number.isNaN(feeNum) ? 'CFA 30' : `CFA ${feeNum}`;

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
