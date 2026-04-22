import { DefaultTheme } from '@react-navigation/native';
import { COLORS } from 'utils/index';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.PRIMARY,
    background: COLORS.WHITE,
    card: COLORS.SECONDARY,
    text: COLORS.BLACK,
    border: COLORS.GRAY,
    notification: COLORS.PRIMARY,
  },
};
