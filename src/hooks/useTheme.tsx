import { useContext } from 'react';
import { ThemeContext } from 'theme/ThemeContext';
import { ThemeContextType } from 'types/themeTypes';

/**
 * Custom hook to access theme context
 * Provides access to current theme, colors, and theme control functions
 *
 * @example
 * const { colors, isDark, toggleTheme, setThemeMode } = useTheme();
 *
 * // Use colors in styles
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.text }}>Hello</Text>
 * </View>
 *
 * // Toggle theme
 * <Button onPress={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} />
 *
 * // Set specific theme mode
 * <Button onPress={() => setThemeMode('system')} title="Use System Theme" />
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
