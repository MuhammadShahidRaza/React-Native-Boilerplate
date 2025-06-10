import { View, StyleSheet } from 'react-native';
import { SvgComponent, Wrapper } from 'components/common';
import { SVG } from 'constants/assets';
import { FLEX_CENTER } from 'utils/commonStyles';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useUserLoginStatus } from 'hooks/useAuth';

export const Splash = () => {
  const appNameRef = useSharedValue(-80);
  const appNameanimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: appNameRef.value }],
  }));
  useEffect(() => {
    appNameRef.value = withTiming(0, { duration: 2000 });
  }, []);
  return (
    <Wrapper>
      <View style={styles.container}>
        <Animated.View style={[appNameanimatedStyle]}>
          <SvgComponent Svg={SVG.LOGO} containerStyle={styles.logoContainer} />
        </Animated.View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...FLEX_CENTER,
  },
  logoContainer: {
    marginVertical: 20,
  },
});
