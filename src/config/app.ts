/**
 * App-specific config for boilerplate customization.
 * Display name and roles are overridden per flavor via `config/variant.ts`.
 */
import { VARIANT } from 'config/variant';

export const APP_CONFIG = {
  APP_NAME: VARIANT.appName,

  /** Customer role (maps, bookings, consumer hub) */
  USER_ROLE: 'user' as const,

  /** Delivery / parcel worker */
  COURIER_ROLE: 'courier' as const,

  /** Ride / vehicle worker */
  DRIVER_ROLE: 'driver' as const,

  USER_ROLE_LABEL: 'Customer',
  COURIER_ROLE_LABEL: 'Courier',
  DRIVER_ROLE_LABEL: 'Driver',

  APP_VERSION: '1.0.0',
} as const;

export type AppUserRole = typeof APP_CONFIG.USER_ROLE;
export type AppCourierRole = typeof APP_CONFIG.COURIER_ROLE;
export type AppDriverRole = typeof APP_CONFIG.DRIVER_ROLE;

/** Courier or driver (or legacy API `dentor`) — same tab stack as the old single “provider” role */
export function isWorkerRole(role: string | undefined | null): boolean {
  if (role == null || role === '') return false;
  return (
    role === APP_CONFIG.COURIER_ROLE ||
    role === APP_CONFIG.DRIVER_ROLE
  );
}
