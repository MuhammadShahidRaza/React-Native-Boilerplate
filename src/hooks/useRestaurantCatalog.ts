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
import { getCurrentLocation } from 'utils/location';
import { updateUserLocation } from 'api/functions/app/user';

/** Restaurants from API with local mock fallback (Order Food / Favorites). */
export function useRestaurantCatalog() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? FOOD_RESTAURANTS : [],
  );
  const [loading, setLoading] = useState(!ENV_CONSTANTS.IS_ALPHA_PHASE);
  const [refreshing, setRefreshing] = useState(false);
  const [locationMissing, setLocationMissing] = useState(false);

  const userDetails = useAppSelector(state => state.user.userDetails);
  const profileLat = userDetails?.latitude ? Number(userDetails.latitude) : undefined;
  const profileLng = userDetails?.longitude ? Number(userDetails.longitude) : undefined;

  const fetchRestaurants = useCallback(async (latitude: number, longitude: number) => {
    const res = await listRestaurants({ latitude, longitude });
    const list = extractRestaurants(res);
    setRestaurants(list.map(mapApiRestaurantToItem));
  }, []);

  const loadRestaurants = useCallback(
    async (isRefresh = false) => {
      if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
        setRestaurants(FOOD_RESTAURANTS);
        setLocationMissing(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        if (profileLat && profileLng) {
          setLocationMissing(false);
          await fetchRestaurants(profileLat, profileLng);
          return;
        }

        // Profile has no saved coordinates yet (e.g. not synced on this device/platform) —
        // fall back to live GPS when permission is already granted instead of gating the screen.
        const pos = await getCurrentLocation();
        if (pos) {
          const { latitude, longitude } = pos.coords;
          setLocationMissing(false);
          updateUserLocation(latitude, longitude);
          await fetchRestaurants(latitude, longitude);
          return;
        }

        setLocationMissing(true);
      } catch (e) {
        logger.error('listRestaurants failed', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [profileLat, profileLng, fetchRestaurants],
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
