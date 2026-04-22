import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View, Easing, StyleProp, ViewStyle } from 'react-native';
import { IMAGES } from 'constants/assets';

interface AnimatedCarProps {
  duration?: number;
  onAnimationComplete?: () => void;
  carImage?: any;
  tireImage?: any;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AnimatedCar: React.FC<AnimatedCarProps> = ({
  duration = 3000,
  onAnimationComplete,
  carImage = IMAGES.CAR,
  tireImage = IMAGES.TIRE,
  containerStyle,
}) => {
  // Car animation: moves from -200 to 0 (from left off-screen to visible)
  const carTranslateX = useRef(new Animated.Value(-200)).current;

  // Tire animation: moves from -100 to 100 (moves right while rotating)
  const tireTranslateX = useRef(new Animated.Value(-100)).current;
  // Tire rotation: rotates 360 degrees (0 to 2π)
  const tireRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start both animations simultaneously
    const carAnimation = Animated.timing(carTranslateX, {
      toValue: 0, // End at 0 (visible at bottom-left)
      duration,
      easing: Easing.out(Easing.cubic), // easeOutCubic
      useNativeDriver: true,
    });

    // Tire moves from -100 to 100 (200 pixels total)
    const tireMoveAnimation = Animated.timing(tireTranslateX, {
      toValue: 100,
      duration,
      easing: Easing.out(Easing.cubic), // easeOutCubic
      useNativeDriver: true,
    });

    // Tire rotates 360 degrees (0 to 1 represents 0 to 2π)
    const tireRotateAnimation = Animated.timing(tireRotation, {
      toValue: 1, // 1 = 360 degrees
      duration,
      easing: Easing.out(Easing.cubic), // easeOutCubic
      useNativeDriver: true,
    });

    // Run all animations in parallel
    Animated.parallel([carAnimation, tireMoveAnimation, tireRotateAnimation]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => {
      carAnimation.stop();
      tireMoveAnimation.stop();
      tireRotateAnimation.stop();
    };
  }, [duration, onAnimationComplete]);

  // Convert rotation value (0-1) to degrees (0-360)
  const tireRotateDegrees = tireRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Car image - animates from left to visible */}
      <Animated.View
        style={[
          styles.carContainer,
          {
            transform: [{ translateX: carTranslateX }],
          },
        ]}
      >
        <Image source={carImage} style={styles.carImage} resizeMode='contain' />
      </Animated.View>

      {/* Tire image - moves and rotates independently (matches Flutter behavior) */}
      <Animated.View
        style={[
          styles.tireContainer,
          {
            transform: [
              { translateX: tireTranslateX },
              { translateY: 15 }, // Vertical offset like Flutter
              { rotate: tireRotateDegrees },
            ],
          },
        ]}
      >
        {tireImage ? (
          <Image source={tireImage} style={styles.tireImage} resizeMode='contain' />
        ) : (
          // Fallback: Show a simple circle to indicate tire position
          <View style={styles.tirePlaceholder} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  carContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 350,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  tireContainer: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Tire should be above car
  },
  tireImage: {
    width: '100%',
    height: '100%',
  },
  tirePlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
});
