import { changeIcon, getIcon } from '@computools/react-native-dynamic-app-icon';
import { isIOS } from './helpers';
import { logger } from 'utils/logger';

type ThemeMode = 'light' | 'dark' | 'default';

/**
 * Changes the app icon based on the theme mode
 * iOS: Uses alternate icons defined in Info.plist
 * Android: Uses activity aliases defined in AndroidManifest.xml
 *
 * @param mode - The theme mode: 'light', 'dark', or 'default'
 * @returns Promise that resolves when icon is changed
 *
 * @example
 * // Switch to dark icon
 * await changeAppIcon('dark');
 *
 * // Switch to light icon
 * await changeAppIcon('light');
 *
 * // Reset to default icon
 * await changeAppIcon('default');
 */
export const changeAppIcon = async (mode: ThemeMode): Promise<void> => {
  try {
    logger.log('[AppIcon] Attempting to change icon to:', mode);

    // Get current icon to avoid unnecessary changes
    const currentIcon = await getIcon();
    // NOTE:
    // - iOS expects the alternate icon key name from Info.plist (e.g. DarkAppIcon/LightAppIcon),
    //   or "DefaultIcon" to reset to primary.
    // - Android implementation in this library expects only the suffix after MainActivity
    //   (e.g. "Dark" -> enables com.cmolds.yourappname.MainActivityDark).
    const targetIcon = isIOS()
      ? mode === 'default'
        ? 'DefaultIcon'
        : mode === 'dark'
          ? 'DarkAppIcon'
          : 'LightAppIcon'
      : mode === 'dark'
        ? 'Dark'
        : mode === 'light'
          ? 'Light'
          : 'Dark';

    // Skip if already using the target icon
    if (currentIcon === targetIcon) {
      logger.log('[AppIcon] Already using icon:', targetIcon);
      return;
    }

    if (isIOS()) {
      // iOS implementation
      logger.log('[AppIcon] iOS: Changing from', currentIcon, 'to:', targetIcon);
      try {
        const result = await changeIcon(targetIcon);
        logger.log('[AppIcon] iOS: Icon change successful, result:', result);
      } catch (iconError: any) {
        logger.error('[AppIcon] iOS: Icon change error details:', {
          code: iconError?.code,
          message: iconError?.message,
          error: iconError,
        });
        throw iconError;
      }
    } else if (!isIOS()) {
      // Android implementation
      logger.log('[AppIcon] Android: Changing to component:', targetIcon);
      await changeIcon(targetIcon);
      logger.log('[AppIcon] Android: Icon change successful');
    }
  } catch (error) {
    logger.error('[AppIcon] Failed to change app icon:', error);
    // Re-throw so UI can show an error
    throw error;
  }
};

/**
 * Gets the current app icon name
 * @returns Promise that resolves with the current icon name
 */
export const getCurrentIcon = async (): Promise<string | null> => {
  try {
    const iconName = await getIcon();
    return iconName;
  } catch (error) {
    logger.warn('Failed to get current icon:', error);
    return null;
  }
};

/**
 * Checks if the device supports app icon changes
 * iOS always supports it on iOS 10.3+
 * Android supports it on Android 5.0+
 * @returns boolean indicating support
 */
export const supportsIconChange = (): boolean => {
  return isIOS() || !isIOS();
};
