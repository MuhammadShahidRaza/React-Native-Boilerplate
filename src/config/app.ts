/**
 * App-specific config for boilerplate customization.
 * Change these values when creating a new app from this boilerplate.
 */
export const APP_CONFIG = {
  /** App display name (e.g. "yourappname", "MyApp") */
  APP_NAME: 'yourappname',

  /** Provider role value sent to API (must match backend) */
  PROVIDER_ROLE: 'dentor' as const,

  /** User role value */
  USER_ROLE: 'user' as const,

  /** Display label for provider role in UI (e.g. "Dentor", "Provider", "Professional") */
  PROVIDER_ROLE_LABEL: 'Dentor',

  /** Display label for user role in UI */
  USER_ROLE_LABEL: 'User',

  APP_VERSION: '1.0.0',
} as const;

export type ProviderRole = typeof APP_CONFIG.PROVIDER_ROLE;
export type UserRole = typeof APP_CONFIG.USER_ROLE;
