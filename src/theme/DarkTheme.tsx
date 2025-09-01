import { DefaultTheme } from '@react-navigation/native';
import { COLORS } from 'utils/index';

export const Darktheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.PRIMARY,
    background: COLORS.BLACK,
    card: COLORS.SECONDARY,
    text: COLORS.WHITE,
    border: COLORS.GRAY,
    notification: COLORS.PRIMARY,
  },
};
