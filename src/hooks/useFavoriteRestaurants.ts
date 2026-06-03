import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getItem, setItem } from 'utils/storage';

const FAVORITE_RESTAURANT_IDS_KEY = 'favorite_restaurant_ids';

async function readFavoriteIds(): Promise<Set<string>> {
  const ids = await getItem<string[]>(FAVORITE_RESTAURANT_IDS_KEY);
  return new Set(ids?.filter(Boolean) ?? []);
}

/** Liked restaurant ids — persisted locally; shared by Order Food and Settings → Favorites. */
export function useFavoriteRestaurants() {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const next = await readFavoriteIds();
    setLikedIds(next);
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const toggleLike = useCallback((id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void setItem(FAVORITE_RESTAURANT_IDS_KEY, Array.from(next));
      return next;
    });
  }, []);

  return { likedIds, toggleLike, hydrated };
}
