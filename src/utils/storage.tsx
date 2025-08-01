import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Set an item in AsyncStorage
 * @param key - The key to store the value under
 * @param value - The value to store (any serializable type)
 */
export const setItem = async (key: string, value: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log('setItem error:', e);
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
    console.log('getItem error:', e);
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
    console.log('removeItem error:', e);
  }
};

/**
 * Clear all keys from AsyncStorage
 */
export const clearAllStorageItems = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.log('clearAllStorageItems error:', e);
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
    console.log('removeMultipleItem error:', e);
  }
};
