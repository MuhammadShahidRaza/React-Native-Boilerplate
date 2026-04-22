import { useEffect, useRef } from 'react';
import { RootStackParamList } from 'navigation/Navigators';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteName = keyof RootStackParamList;

/** Route entry for reset stack (params optional per screen) */
export type ResetStackRoute = {
  name: RouteName;
  params?: RootStackParamList[RouteName];
};

export type ResetStackConfig = {
  /** Index of the active (focused) route in the routes array */
  index: number;
  /** New stack: e.g. [GetStarted, Login] */
  routes: ResetStackRoute[];
};

type Navigation = NativeStackNavigationProp<RootStackParamList, RouteName>;

/**
 * Intercept all back actions (hardware back, header back, swipe gesture) and reset
 * the stack to the given routes instead. Use on 3–4 screens with different configs.
 *
 * @param navigation - from screen props or useNavigation()
 * @param config - { index, routes } for navigation.reset()
 * @param when - optional: only intercept when true (default true). Use boolean or () => boolean for conditional behavior.
 *
 * @example
 * // Verification: always go to Get Started → Login
 * useResetStackOnBack(navigation, {
 *   index: 1,
 *   routes: [
 *     { name: SCREENS.GET_STARTED },
 *     { name: SCREENS.LOGIN },
 *   ],
 * });
 *
 * @example
 * // Forgot Password: only reset when coming from deep link
 * useResetStackOnBack(navigation, { index: 0, routes: [{ name: SCREENS.LOGIN }] }, () => fromDeepLink);
 *
 * @example
 * // Reset Password: go to Login only
 * useResetStackOnBack(navigation, {
 *   index: 0,
 *   routes: [{ name: SCREENS.LOGIN }],
 * }, true);
 */
export function useResetStackOnBack(
  navigation: Navigation,
  config: ResetStackConfig,
  when: boolean | (() => boolean) = true,
): void {
  const shouldIntercept = typeof when === 'function' ? when() : when;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!shouldIntercept) return;

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      unsubscribe();
      navigation.reset(configRef.current);
    });
    return unsubscribe;
  }, [navigation, shouldIntercept]);
}
