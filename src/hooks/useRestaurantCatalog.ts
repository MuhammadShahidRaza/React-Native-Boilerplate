import { useEffect, useState } from 'react';
import {
  FOOD_RESTAURANTS,
  type RestaurantItem,
} from 'components/common/food/foodRestaurants';
import {
  extractRestaurants,
  listRestaurants,
  mapApiRestaurantToItem,
} from 'api/functions/snlift/restaurants';
import { logger } from 'utils/logger';

/** Restaurants from API with local mock fallback (Order Food / Favorites). */
export function useRestaurantCatalog() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(FOOD_RESTAURANTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listRestaurants();
        const list = extractRestaurants(res);
        if (!cancelled && list.length > 0) {
          setRestaurants(list.map(mapApiRestaurantToItem));
        }
      } catch (e) {
        logger.error('listRestaurants failed, using local mock list', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { restaurants, loading };
}
