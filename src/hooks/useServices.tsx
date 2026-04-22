import { useEffect } from 'react';
import { useAppSelector } from 'types/reduxTypes';
import type { Service } from 'types/responseTypes';
import { getServices } from 'api/functions/app/home';

/**
 * Use the services list in any screen. Fetches from API only when the list is empty;
 * otherwise returns cached list. Use this in 3–4 screens instead of duplicating fetch logic.
 */

export function useServices(): {
  services: Service[];
} {
  const services = useAppSelector(state => state.services.services);

  useEffect(() => {
    if (services?.length === 0 || services == null) {
      getServices();
    }
  }, [services?.length]);

  return { services };
}
