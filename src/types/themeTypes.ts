import { Theme } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary colors
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;

  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  // UI colors
  border: string;
  divider: string;
  icon: string;
  iconSecondary: string;
  placeholder: string;

  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;

  // Card colors
  card: string;
  cardBorder: string;

  // Status colors
  success: string;
  warning: string;
  info: string;

  // Overlay colors
  overlay: string;
  shadow: string;

  // Header
  header: string;
  headerText: string;

  // Navigation specific
  notification: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export interface AppTheme extends Theme {
  dark: boolean;
  colors: Theme['colors'] & ThemeColors;
}

export interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  themeVersion: number;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
}
