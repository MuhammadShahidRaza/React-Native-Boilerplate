import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { AppTheme, ThemeColors } from 'types/themeTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY } from 'utils/colors';

const darkColors: ThemeColors = {
  primary: BRAND_PRIMARY,
  secondary: BRAND_SECONDARY,
  background: '#0B1220',
  surface: '#141C2E',
  error: '#FB344F',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',
  textInverse: '#0F172A',

  border: '#2D3A52',
  divider: '#2D3A52',
  icon: '#94A3B8',
  iconSecondary: '#64748B',
  placeholder: '#64748B',

  inputBackground: '#1A2438',
  inputBorder: '#334155',
  inputText: '#F1F5F9',

  card: '#1A2438',
  cardBorder: '#2D3A52',

  success: '#33C88E',
  warning: '#FF9800',
  info: '#5B8DEF',

  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: '#000000',

  header: '#141C2E',
  headerText: '#F1F5F9',

  notification: '#FB344F',
  tabBar: '#003380',
  tabBarActive: '#FFFFFF',
  tabBarInactive: 'rgba(255,255,255,0.5)',
};

export const DarkTheme: AppTheme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkColors,
  },
};
