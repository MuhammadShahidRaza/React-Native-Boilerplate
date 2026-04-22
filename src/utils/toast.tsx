import Toast, { ToastPosition, ToastType } from 'react-native-toast-message';
import { logger } from 'utils/logger';

/** Module-level timer so toast always hides after duration (unaffected by scroll/pan) */
let hideToastTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Toast Type Options
 */
export type ToastTypeOption = 'success' | 'error' | 'info';

/**
 * Parameters for showing a toast
 */
interface ShowToastParams {
  /** The message to display (required if text1/text2 not provided) */
  message?: string;
  /** If true, shows error toast (default: true). Ignored if type is provided */
  isError?: boolean;
  /** Toast type: 'success' | 'error' | 'info' (optional, overrides isError) */
  type?: ToastTypeOption;
  /** Toast position: 'top' | 'bottom' (default: 'top') */
  position?: ToastPosition;
  /** Optional title text (if provided, message will be used as text2) */
  text1?: string;
  /** Optional description text */
  text2?: string;
}

/**
 * 🎯 Enhanced Toast Utility with Primary Color & Theme Support
 *
 * Features:
 * - Clean API with flexible message handling
 * - Supports long messages with automatic wrapping
 * - Works seamlessly with ToastConfig (theme-aware)
 * - Multiple toast types: success, error, info
 *
 * @param params - Toast configuration parameters
 *
 * @example
 * // Simple success toast
 * showToast({ message: 'Operation successful!', isError: false });
 *
 * // Simple error toast
 * showToast({ message: 'Something went wrong' });
 *
 * // Info toast with primary color
 * showToast({ message: 'New update available', type: 'info' });
 *
 * // With custom title and description
 * showToast({
 *   text1: 'Success',
 *   text2: 'Your changes have been saved',
 *   type: 'success'
 * });
 *
 * // Title with message as description
 * showToast({
 *   text1: 'Error',
 *   message: 'Failed to connect to server. Please check your internet connection.',
 *   type: 'error'
 * });
 *
 * // Long message (automatically handled)
 * showToast({
 *   message: 'This is a very long message that will automatically wrap and display properly in the toast component',
 *   type: 'info'
 * });
 */
export const showToast = ({
  message,
  isError = true,
  type,
  position = 'top',
  text1,
  text2,
}: ShowToastParams): void => {
  // Validate input - must have at least message, text1, or text2
  if (!message && !text1 && !text2) {
    logger.warn('showToast called without message, text1, or text2');
    return;
  }

  // Validate message if provided
  if (message && (typeof message !== 'string' || message.trim().length === 0)) {
    logger.warn('showToast called with invalid message:', message);
    return;
  }

  // Determine toast type
  let toastType: ToastType = 'error';
  if (type) {
    toastType = type;
  } else {
    toastType = isError ? 'error' : 'success';
  }

  const visibilityTime = 4000;

  // Build toast configuration
  const toastConfig: any = {
    type: toastType,
    position,
    visibilityTime,
    autoHide: true,
  };

  // Handle text1 and text2
  if (text1 && text2) {
    // Both provided - use as is
    toastConfig.text1 = text1;
    toastConfig.text2 = text2;
  } else if (text1 && message) {
    // Title provided with message - use title as text1, message as text2
    toastConfig.text1 = text1;
    toastConfig.text2 = message;
  } else if (text1) {
    // Only title provided
    toastConfig.text1 = text1;
  } else if (text2) {
    // Only description provided
    toastConfig.text2 = text2;
  } else if (message) {
    // Only message provided - always use text2 for better wrapping support
    // text2 has better support for long messages and wrapping
    toastConfig.text2 = message;
  }

  // Clear any existing hide timer (e.g. from a previous toast)
  if (hideToastTimer) {
    clearTimeout(hideToastTimer);
    hideToastTimer = null;
  }

  // Show the toast
  Toast.show(toastConfig);

  // Guarantee hide after duration even if user scrolls/drags (library timer can be interrupted)
  hideToastTimer = setTimeout(() => {
    Toast.hide();
    hideToastTimer = null;
  }, visibilityTime);
};

/**
 * Convenience functions for common toast types
 */

/**
 * Show a success toast
 */
export const showSuccessToast = (message: string, text1?: string) => {
  showToast({ message, type: 'success', text1 });
};

/**
 * Show an error toast
 */
export const showErrorToast = (message: string, text1?: string) => {
  showToast({ message, type: 'error', text1 });
};

/**
 * Show an info toast
 */
export const showInfoToast = (message: string, text1?: string) => {
  showToast({ message, type: 'info', text1 });
};
