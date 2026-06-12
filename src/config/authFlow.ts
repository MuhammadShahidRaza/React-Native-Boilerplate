import { reset } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import type { ResetStackRoute } from 'hooks/useResetStackOnBack';
import { VARIANT } from './variant';

/** First auth screen after splash (role picker or login). */
export function getAuthEntryScreen(): typeof SCREENS.GET_STARTED | typeof SCREENS.LOGIN {
  return VARIANT.features.showGetStarted ? SCREENS.GET_STARTED : SCREENS.LOGIN;
}

/** Stack below the current auth screen for back-reset (e.g. Verification → Login). */
export function getAuthStackRoutes(): ResetStackRoute[] {
  const routes: ResetStackRoute[] = [];
  if (VARIANT.features.showGetStarted) {
    routes.push({ name: SCREENS.GET_STARTED });
  }
  // routes.push({ name: SCREENS.LOGIN });
  routes.push({ name: SCREENS.GET_STARTED });
  return routes;
}

/** Index of LOGIN inside `getAuthStackRoutes()`. */
export function getAuthStackLoginIndex(): number {
  return getAuthStackRoutes().length - 1;
}

export function resetToAuthEntry(): void {
  reset(getAuthEntryScreen());
}
