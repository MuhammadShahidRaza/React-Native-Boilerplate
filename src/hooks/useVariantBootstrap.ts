import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setRole } from 'store/slices/user';
import { VARIANT } from 'config/variant';
import type { USER_TYPE } from 'types/auth';

/** Apply per-flavor defaults once on launch (e.g. Sengo customer → user role). */
export function useVariantBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const role = VARIANT.features.defaultRole as USER_TYPE | null;
    if (role) {
      dispatch(setRole(role));
    }
  }, [dispatch]);
}
