import { useEffect, useState } from 'react';
import { getUserById } from 'api/functions/app/user';
import type { User } from 'types/responseTypes';

export function useUserById(userId: number | string | null | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    const id = userId ? Number(userId) : 0;
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserById(id)
      .then(u => {
        setUser(u);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return { user, loading };
}

/** Fetch multiple users by ID, returns map of userId -> User and loading state */
export function useUsersByIds(userIds: string[], refreshTrigger?: number) {
  const [usersMap, setUsersMap] = useState<Record<string, User | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (ids.length === 0) {
      setUsersMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map(id => getUserById(Number(id)).then(u => ({ id, u }))))
      .then(results => {
        const map: Record<string, User | null> = {};
        results.forEach(({ id, u }) => {
          map[id] = u;
        });
        setUsersMap(map);
      })
      .finally(() => setLoading(false));
  }, [userIds.join(','), refreshTrigger]);

  return { usersMap, loading: loading };
}
