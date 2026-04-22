import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { COLORS } from './colors';

type NamedStyles<T> = { [P in keyof T]: any };

/**
 * Creates a hook that returns dynamically themed styles.
 * This is the recommended approach for theme-aware StyleSheets.
 *
 * @example
 * // Define styles with makeStyles (receives colors as parameter)
 * const useStyles = makeStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.BACKGROUND,
 *     flex: 1,
 *   },
 *   text: {
 *     color: colors.TEXT,
 *     fontSize: 16,
 *   },
 * }));
 *
 * // Use in component
 * const MyComponent = () => {
 *   const styles = useStyles();
 *   return (
 *     <View style={styles.container}>
 *       <Text style={styles.text}>Hello</Text>
 *     </View>
 *   );
 * };
 */
export function makeStyles<T extends NamedStyles<T>>(
  styleCreator: (colors: typeof COLORS) => T,
): () => T {
  return function useStyles(): T {
    const { isDark } = useTheme();

    const styles = useMemo(() => {
      // COLORS object is already updated by ThemeProvider
      return StyleSheet.create(styleCreator(COLORS));
    }, [isDark]);

    return styles;
  };
}

/**
 * Alternative: Create styles directly with current COLORS (non-hook version)
 * Use this for styles that don't need to be reactive (e.g., in non-component files)
 *
 * @example
 * const styles = createThemedStyles((colors) => ({
 *   container: { backgroundColor: colors.BACKGROUND },
 * }));
 */
export function createThemedStyles<T extends NamedStyles<T>>(
  styleCreator: (colors: typeof COLORS) => T,
): T {
  return StyleSheet.create(styleCreator(COLORS));
}
