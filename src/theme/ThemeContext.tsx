import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { AppTheme, ThemeColors, ThemeContextType, ThemeMode } from 'types/themeTypes';
import { LightTheme, DarkTheme } from './themes';
import { getItem, setItem } from 'utils/storage';
import { logger } from 'utils/logger';
import { updateColors } from 'utils/colors';
import { refreshThemedStyleSheets } from 'utils/themedStyleSheet';
// import { changeAppIcon } from 'utils/appIcon';

const THEME_STORAGE_KEY = '@app_theme_mode';

// Default context value
const defaultContext: ThemeContextType = {
  theme: LightTheme,
  themeMode: 'system',
  isDark: false,
  themeVersion: 0,
  setThemeMode: () => {},
  toggleTheme: () => {},
  colors: LightTheme.colors,
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use the hook for initial value and basic reactivity
  const colorSchemeFromHook = useColorScheme();
  // Also track with state that updates from Appearance listener for reliable updates
  const [systemColorScheme, setSystemColorScheme] = useState(colorSchemeFromHook);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);

  // Sync state when hook value changes
  useEffect(() => {
    setSystemColorScheme(colorSchemeFromHook);
  }, [colorSchemeFromHook]);

  // Listen for system appearance changes (backup for when hook doesn't trigger)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await getItem<string>(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        logger.warn('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadThemePreference();
  }, []);

  // Determine if dark mode should be active
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Update COLORS object when theme changes and force re-render
  useEffect(() => {
    updateColors(isDark);
    refreshThemedStyleSheets();
    // Signal to the app that theme-dependent styles should be recomputed
    setThemeVersion(v => v + 1);

    // Note: Automatic icon changes disabled due to iOS limitations
    // iOS cancels icon changes that aren't directly triggered by user interaction
    // Icon changes should be done manually through a settings UI instead
    //

    // Change app icon based on theme (always follows current dark/light state)
    // const updateIcon = async () => {
    //   await changeAppIcon(isDark ? 'dark' : 'light');
    // };
    // updateIcon();
  }, [isDark]);

  // Get the current theme object
  const theme: AppTheme = useMemo(() => {
    return isDark ? DarkTheme : LightTheme;
  }, [isDark]);

  // Get just the colors for convenience
  const colors: ThemeColors = useMemo(() => theme.colors, [theme]);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      logger.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark (useful for quick toggle buttons)
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const value: ThemeContextType = useMemo(
    () => ({
      theme,
      themeMode,
      isDark,
      themeVersion,
      setThemeMode,
      toggleTheme,
      colors,
    }),
    [theme, themeMode, isDark, themeVersion, setThemeMode, toggleTheme, colors],
  );

  // Don't render until theme is initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  // Force a re-render of the app tree when theme changes, without remounting.
  // Many screens don't consume ThemeContext directly, so they won't re-render
  // unless a parent re-renders with changed element props.
  const themedChildren = Children.map(children, child => {
    if (!isValidElement(child)) {
      return child;
    }

    // Add a prop that changes whenever themeVersion changes.
    // This triggers a re-render of the child component instance (no remount).
    return cloneElement(child as React.ReactElement<any>, {
      __themeVersion: themeVersion,
    });
  });

  // Use key to force re-mount of children when theme changes
  // This ensures components using COLORS directly get updated
  return <ThemeContext.Provider value={value}>{themedChildren}</ThemeContext.Provider>;
};
