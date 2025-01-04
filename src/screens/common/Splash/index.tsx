import {View, StyleSheet} from 'react-native';
import {SvgComponent, Wrapper} from 'components/common';
import {SVG} from 'constants/assets';
import {CENTER, FLEX_BETWEEN} from 'utils/commonStyles';
import {COLORS} from 'utils/colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';

export const Splash = () => {
  const circleRef = useSharedValue(90);
  const appNameRef = useSharedValue(-80);

  const circleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${circleRef.value}deg`}],
    };
  });

  const appNameanimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: appNameRef.value}],
  }));

  useEffect(() => {
    circleRef.value = withTiming(0, {duration: 2000});
    appNameRef.value = withTiming(0, {duration: 2000});
  }, []);

  return (
    <Wrapper>
      <View style={[styles.container, FLEX_BETWEEN]}>
        <View />

        <View style={styles.centeredView}>
          <SvgComponent Svg={SVG.LOGO} containerStyle={styles.logoContainer} />
          <View style={styles.nameContainer}>
            <Animated.View style={[appNameanimatedStyle]}>
              <SvgComponent Svg={SVG.APP_NAME} />
            </Animated.View>
          </View>
        </View>

        <View>
          <SvgComponent Svg={SVG.SPLASH_BOTTOM_CURVE} />
          <Animated.View
            style={[styles.circle, {right: -10}, circleAnimatedStyle]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                left: -10,
                borderRightColor: COLORS.SECONDARY,
                borderLeftColor: COLORS.SECONDARY,
              },
              circleAnimatedStyle,
            ]}
          />
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    ...CENTER,
  },
  logoContainer: {
    marginVertical: 20,
  },
  nameContainer: {
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderBottomColor: COLORS.PRIMARY,
    borderTopColor: COLORS.SECONDARY,
    borderLeftColor: COLORS.PRIMARY,
    borderRightColor: COLORS.PRIMARY,
    borderWidth: 30,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 140 / 2,
  },
});
