import { StyleSheet, View } from 'react-native';
import { AnimatedCar, SvgComponent } from 'components/common';
import { SVG } from 'constants/assets';
import { screenHeight, screenWidth, COLORS } from 'utils/index';

export const Splash = () => {
  return (
    <View style={styles.container}>
      {/* Center Logo */}
      <View style={styles.logoContainer}>
        <SvgComponent
          Svg={SVG.LOGO_WITH_NAME}
          svgHeight={screenHeight(40)}
          svgWidth={screenWidth(50)}
          fill={COLORS.APP_ICON}
        />
      </View>

      {/* Animated car and tire at the bottom */}
      <AnimatedCar duration={3000} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
