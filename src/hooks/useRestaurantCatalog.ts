import { useCallback, useEffect, useState } from 'react';
import { FOOD_RESTAURANTS, type RestaurantItem } from 'components/common/food/foodRestaurants';
import {
  extractRestaurants,
  listRestaurants,
  mapApiRestaurantToItem,
} from 'api/functions/snlift/restaurants';
import { logger } from 'utils/logger';
import { useAppSelector } from 'types/reduxTypes';
import { ENV_CONSTANTS } from 'constants/common';

/** Restaurants from API with local mock fallback (Order Food / Favorites). */
export function useRestaurantCatalog() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? FOOD_RESTAURANTS : [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationMissing, setLocationMissing] = useState(false);

  const userDetails = useAppSelector(state => state.user.userDetails);
  const latitude = userDetails?.latitude ? Number(userDetails.latitude) : undefined;
  const longitude = userDetails?.longitude ? Number(userDetails.longitude) : undefined;

  const loadRestaurants = useCallback(
    async (isRefresh = false) => {
      if (!latitude || !longitude) {
        setLocationMissing(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setLocationMissing(false);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await listRestaurants({ latitude, longitude });
        const list = extractRestaurants(res);
        if (list.length > 0) {
          setRestaurants(list.map(mapApiRestaurantToItem));
        }
      } catch (e) {
        logger.error('listRestaurants failed', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [latitude, longitude],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadRestaurants(false);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRestaurants]);

  const refresh = useCallback(() => loadRestaurants(true), [loadRestaurants]);

  return { restaurants, loading, refreshing, refresh, locationMissing };
};
