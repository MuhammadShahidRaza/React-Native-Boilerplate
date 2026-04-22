import { DefaultTheme } from '@react-navigation/native';
import { AppTheme, ThemeColors } from 'types/themeTypes';

const lightColors: ThemeColors = {
  // Primary colors
  primary: '#051229',
  secondary: '#0AC8FF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#FB344F',

  // Text colors
  text: '#000000',
  textSecondary: '#4D4D4D',
  textDisabled: '#858585',
  textInverse: '#FFFFFF',

  // UI colors
  border: '#CACACA',
  divider: '#ECECEC',
  icon: '#676767',
  iconSecondary: '#858585',
  placeholder: '#858585',

  // Input colors
  inputBackground: '#F9F9F9',
  inputBorder: '#CACACA',
  inputText: '#000000',

  // Card colors
  card: '#FFFFFF',
  cardBorder: '#ECECEC',

  // Status colors
  success: '#00B406',
  warning: '#FFA500',
  info: '#0AC8FF',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',

  // Header
  header: '#ECECEC',
  headerText: '#000000',

  // Navigation specific
  notification: '#FB344F',
  tabBar: '#FFFFFF',
  tabBarActive: '#051229',
  tabBarInactive: '#858585',
};

export const LightTheme: AppTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...lightColors,
  },
};
