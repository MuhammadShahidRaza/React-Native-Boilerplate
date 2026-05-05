import { DefaultTheme } from '@react-navigation/native';
import { AppTheme, ThemeColors } from 'types/themeTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY } from 'utils/colors';

const lightColors: ThemeColors = {
  primary: BRAND_PRIMARY,
  secondary: BRAND_SECONDARY,
  background: '#F7FAFC',
  surface: '#FFFFFF',
  error: '#FB344F',

  text: '#0F172A',
  textSecondary: '#475569',
  textDisabled: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  divider: '#E2E8F0',
  icon: '#475569',
  iconSecondary: '#64748B',
  placeholder: '#94A3B8',

  inputBackground: '#F1F5F9',
  inputBorder: '#CBD5E1',
  inputText: '#0F172A',

  card: '#FFFFFF',
  cardBorder: '#E2E8F0',

  success: BRAND_PRIMARY,
  warning: '#FFA500',
  info: BRAND_SECONDARY,

  overlay: 'rgba(15, 23, 42, 0.45)',
  shadow: '#0F172A',

  header: '#FFFFFF',
  headerText: '#0F172A',

  notification: '#FB344F',
  tabBar: BRAND_SECONDARY,
  tabBarActive: '#FFFFFF',
  tabBarInactive: 'rgba(255,255,255,0.55)',
};

export const LightTheme: AppTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...lightColors,
  },
};
