import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for smooth fade transition between two views
 * @returns Object with opacity values and transition function
 */
export const useFadeTransition = () => {
  const fromOpacity = useRef(new Animated.Value(1)).current;
  const toOpacity = useRef(new Animated.Value(0)).current;

  const reset = useCallback(() => {
    fromOpacity.setValue(1);
    toOpacity.setValue(0);
  }, [fromOpacity, toOpacity]);

  const transition = useCallback(
    (duration: number = 250, delay: number = 50, onComplete?: () => void) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fromOpacity, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(toOpacity, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
      }, delay);
    },
    [fromOpacity, toOpacity],
  );

  return {
    fromOpacity,
    toOpacity,
    reset,
    transition,
  };
};
