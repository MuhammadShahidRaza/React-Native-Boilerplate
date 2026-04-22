import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'hooks/useTheme';

/**
 * Recomputes theme-dependent values when theme changes.
 *
 * Note: This is required if styles were created using `StyleSheet.create()`
 * with `COLORS.*` at module scope; otherwise those values are frozen.
 */
export const useThemedStyles = <T>(create: () => T): T => {
  const { themeVersion } = useTheme();
  return useMemo(() => create(), [themeVersion]);
};

export const useThemedColorsStyles = <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(
  factory: () => T,
): T => {
  const { themeVersion } = useTheme();
  return useMemo(() => StyleSheet.create(factory()), [themeVersion]) as T;
};
