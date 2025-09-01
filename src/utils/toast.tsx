import Toast, { ToastPosition, ToastType } from 'react-native-toast-message';
import { COLORS } from './index';
import { FontSize, FontWeight } from 'types/fontTypes';

interface ToastConfig {
  type: ToastType;
  position: ToastPosition;
  text1?: string;
  text2?: string;
  text1Style?: {
    color: string;
    fontWeight: FontWeight;
  };
  text2Style?: {
    color: string;
    fontWeight: FontWeight;
    fontSize: number;
  };
}

interface ShowToastParams {
  message: string;
  isError?: boolean;
}

export const showToast = ({ message, isError = true }: ShowToastParams): void => {
  const toastConfig: ToastConfig = {
    type: isError ? 'error' : 'success',
    position: 'top',
  };

  if (message.length <= 40) {
    toastConfig.text1 = message;
    toastConfig.text1Style = {
      color: isError ? COLORS.RED : COLORS.GREEN,
      fontWeight: FontWeight.SemiBold,
    };
  } else {
    toastConfig.text2 = message;
    toastConfig.text2Style = {
      color: isError ? COLORS.RED : COLORS.GREEN,
      fontWeight: FontWeight.SemiBold,
      fontSize: FontSize.XsSmall,
    };
  }

  Toast.show(toastConfig);
};
