import { useEffect, useState } from 'react';
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
  const [locationMissing, setLocationMissing] = useState(false);

  const userDetails = useAppSelector(state => state.user.userDetails);
  const latitude = userDetails?.latitude ? Number(userDetails.latitude) : undefined;
  const longitude = userDetails?.longitude ? Number(userDetails.longitude) : undefined;

  useEffect(() => {
    let cancelled = false;
    if (!latitude || !longitude) {
      setLocationMissing(true);
      setLoading(false);
      return;
    }
    setLocationMissing(false);
    (async () => {
      try {
        const res = await listRestaurants({ latitude, longitude });
        const list = extractRestaurants(res);
        if (!cancelled && list.length > 0) {
          setRestaurants(list.map(mapApiRestaurantToItem));
        }
      } catch (e) {
        logger.error('listRestaurants failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return { restaurants, loading, locationMissing };
}
