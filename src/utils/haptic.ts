import { Platform, Vibration } from 'react-native';

/**
 * Trigger a lightweight haptic tap feedback.
 * - Android: 30 ms vibration
 * - iOS: standard system vibration (Vibration ignores duration on iOS)
 * No extra packages or pod install required — uses RN core Vibration API.
 */
export const triggerHaptic = () => {
  if (Platform.OS === 'android') {
    // Vibration.vibrate(10);
  } else {
    // Vibration.vibrate();
  }
};
