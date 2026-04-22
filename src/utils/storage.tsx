// ============ ASYNC STORAGE (for general app data) ============
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VARIABLES } from 'constants/common';
import { logger } from 'utils/logger';
import type { USER_TYPE } from 'types/auth';
// ============ Keychain STORAGE (for super sensitive data) ============
import * as Keychain from 'react-native-keychain';

/**
 * Set an item in AsyncStorage
 * @param key - The key to store the value under
 * @param value - The value to store (any serializable type)
 */
export const setItem = async (key: string, value: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.log('setItem error:', e);
  }
};

/**
 * Get an item from AsyncStorage
 * @param key - The key to retrieve the value from
 * @returns The parsed value or null
 */
export const getItem = async <T = unknown,>(key: string): Promise<T | null> => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (e) {
    logger.log('getItem error:', e);
    return null;
  }
};

/**
 * Remove a single item from AsyncStorage
 * @param key - The key to remove
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    logger.log('removeItem error:', e);
  }
};

/**
 * Clear all keys from AsyncStorage
 */
export const clearAllStorageItems = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    logger.log('clearAllStorageItems error:', e);
  }
};

/**
 * Remove multiple items from AsyncStorage
 * @param keys - Array of keys to remove
 */
export const removeMultipleItem = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    logger.log('removeMultipleItem error:', e);
  }
};

// ============ KEYCHAIN (optional, for super sensitive data) ============

/**
 * Save super sensitive data to Keychain (survives uninstall)
 * Use for biometric keys, encryption keys only
 */
export const setKeychainItem = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value || '', {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  } catch (error) {
    logger.error('setKeychainItem error:', error);
    throw error;
  }
};

/**
 * Get data from Keychain
 */
export const getKeychainItem = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials && typeof credentials !== 'boolean') {
      return credentials.password;
    }
    return null;
  } catch (error) {
    logger.error('getKeychainItem error:', error);
    return null;
  }
};

const isKeychainAuthError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /no fingerprints enrolled/i.test(msg) ||
    /no face id enrolled/i.test(msg) ||
    /key permanently invalidated/i.test(msg) ||
    /errSecAuthFailed/i.test(msg) ||
    /user canceled/i.test(msg)
  );
};

/**
 * Get Keychain item with biometric/device passcode prompt (for sensitive data like saved credentials).
 * Falls back to getKeychainItem on iPhone X / devices where accessControl causes errors.
 */
export const getKeychainItemWithAuth = async (
  key: string,
  prompt?: { title?: string; subtitle?: string },
): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: key,
      authenticationPrompt: {
        title: prompt?.title ?? 'Verify device',
        subtitle: prompt?.subtitle ?? 'Authenticate to unlock saved credentials',
      },
    });
    if (credentials && typeof credentials !== 'boolean') {
      return credentials.password;
    }
    return null;
  } catch (error) {
    if (isKeychainAuthError(error)) {
      try {
        return await getKeychainItem(key);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Remove item from Keychain
 */
export const removeKeychainItem = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch (error) {
    logger.error('removeKeychainItem error:', error);
  }
};

// ------------ User details by role (keychain stores { user?: {...}, dentor?: {...} }) ------------

const SAVED_CREDENTIALS_ROLES = 'saved_credentials_roles';

export type SavedUserDetails = { email?: string; password?: string; user_type?: USER_TYPE };

/** Cached byRole after auth - used by saveUserDetailsForRole to avoid double biometric prompt */
let cachedByRoleAfterAuth: Record<string, SavedUserDetails> | null = null;

/** Get saved credentials for one role. Prompts biometric only when THIS role has saved data. Returns null if user cancels or none. */
export const getUserDetailsByRole = async (
  role: string,
  prompt?: { title?: string; subtitle?: string },
): Promise<SavedUserDetails | null> => {
  let roles = await getItem<string[]>(SAVED_CREDENTIALS_ROLES);
  if (!roles?.length) {
    const hasAny = await Keychain.hasGenericPassword({ service: VARIABLES.USER_DETAILS });
    if (!hasAny) return null;
    roles = null;
  } else if (!roles.includes(role)) {
    return null;
  }

  const raw = await getKeychainItemWithAuth(VARIABLES.USER_DETAILS, {
    title: prompt?.title ?? 'Unlock saved credentials',
    subtitle: prompt?.subtitle ?? 'Authenticate to load your saved email and password',
  });
  if (!raw) return null;
  try {
    const byRole = JSON.parse(raw) as Record<string, SavedUserDetails>;
    cachedByRoleAfterAuth = byRole;
    const saved = byRole[role] ?? null;
    if (!roles?.length) {
      await setItem(SAVED_CREDENTIALS_ROLES, Object.keys(byRole));
    }
    return saved;
  } catch {
    return null;
  }
};

/** Save credentials for one role; keeps other roles' data intact. Uses biometric protection. */
export const saveUserDetailsForRole = async (
  role: string,
  payload: SavedUserDetails,
): Promise<void> => {
  let byRole: Record<string, SavedUserDetails> = cachedByRoleAfterAuth ?? {};
  if (!cachedByRoleAfterAuth) {
    const hasExisting = await Keychain.hasGenericPassword({ service: VARIABLES.USER_DETAILS });
    if (hasExisting) {
      const raw = await getKeychainItemWithAuth(VARIABLES.USER_DETAILS, {
        title: 'Verify to save',
        subtitle: 'Authenticate to save your credentials',
      });
      if (raw) {
        try {
          byRole = JSON.parse(raw) as Record<string, SavedUserDetails>;
        } catch {
          byRole = {};
        }
      }
    }
  }
  byRole[role] = payload;
  cachedByRoleAfterAuth = null;
  const savePayload = JSON.stringify(byRole);
  try {
    await Keychain.setGenericPassword(VARIABLES.USER_DETAILS, savePayload, {
      service: VARIABLES.USER_DETAILS,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    });
  } catch {
    try {
      await Keychain.setGenericPassword(VARIABLES.USER_DETAILS, savePayload, {
        service: VARIABLES.USER_DETAILS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } catch (err) {
      logger.log('saveUserDetailsForRole error:', err);
      throw err;
    }
  }
  const roles = await getItem<string[]>(SAVED_CREDENTIALS_ROLES);
  const next = [...new Set([...(roles ?? []), role])];
  await setItem(SAVED_CREDENTIALS_ROLES, next);
};

/** Clear saved credentials (keychain + roles list). Call on logout. */
export const clearSavedCredentials = async (): Promise<void> => {
  await removeKeychainItem(VARIABLES.USER_DETAILS);
  await removeItem(SAVED_CREDENTIALS_ROLES);
};

/** Clear all user-related storage (keychain + AsyncStorage). Call on logout. */
export const clearUserStorageOnLogout = async (): Promise<void> => {
  await Promise.all([
    removeKeychainItem(VARIABLES.USER_TOKEN),
    removeMultipleItem([VARIABLES.IS_USER_LOGGED_IN]),
  ]);
};

/**
 * Update password for one role only if the saved email matches the current user.
 * Prevents updating another account's saved credentials.
 */
export const updateUserDetailsPasswordForRole = async ({
  role,
  newPassword,
  currentUserEmail,
}: {
  role: string;
  newPassword: string;
  currentUserEmail: string;
}): Promise<void> => {
  const raw = await getKeychainItem(VARIABLES.USER_DETAILS);
  if (!raw) return;
  try {
    const byRole = JSON.parse(raw) as Record<string, SavedUserDetails>;
    const saved = byRole[role];
    if (!saved?.email || saved.email !== currentUserEmail) return;
    byRole[role] = { ...saved, password: newPassword };
    await setKeychainItem(VARIABLES.USER_DETAILS, JSON.stringify(byRole));
  } catch {
    // ignore
  }
};
