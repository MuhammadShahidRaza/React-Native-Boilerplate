import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { AppTheme, ThemeColors } from 'types/themeTypes';

const darkColors: ThemeColors = {
  // Primary colors
  primary: '#0AC8FF',
  secondary: '#051229',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#FB344F',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textDisabled: '#666666',
  textInverse: '#000000',

  // UI colors
  border: '#333333',
  divider: '#2A2A2A',
  icon: '#B3B3B3',
  iconSecondary: '#808080',
  placeholder: '#666666',

  // Input colors
  inputBackground: '#1E1E1E',
  inputBorder: '#333333',
  inputText: '#FFFFFF',

  // Card colors
  card: '#1E1E1E',
  cardBorder: '#333333',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#0AC8FF',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',

  // Header
  header: '#1E1E1E',
  headerText: '#FFFFFF',

  // Navigation specific
  notification: '#FB344F',
  tabBar: '#1E1E1E',
  tabBarActive: '#0AC8FF',
  tabBarInactive: '#808080',
};

export const DarkTheme: AppTheme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkColors,
  },
};
