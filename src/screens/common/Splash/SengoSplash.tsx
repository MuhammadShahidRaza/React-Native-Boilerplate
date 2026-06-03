import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';
import { SvgComponent } from 'components/common';
import { getBrandLogoAspect, getBrandLogoSvg } from 'constants/assets/brandLogo';
import { SENGO_IMAGES } from 'constants/assets/variantImages';
import { COLORS, screenWidth } from 'utils/index';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_W = SCREEN_W * 0.72;
const LOGO_H = LOGO_W * getBrandLogoAspect('light');
const CLOUD_W = screenWidth(42);
const CLOUD_H = screenWidth(20);
const LogoSvg = getBrandLogoSvg('light');

/** Sengo splash: clouds meet at top center, split L/R, then logo fade in/out. */
export const SengoSplash = () => {
  const cloudCenterOpacity = useRef(new Animated.Value(1)).current;
  const cloudLeftOpacity = useRef(new Animated.Value(1)).current;
  const cloudRightOpacity = useRef(new Animated.Value(1)).current;
  const cloudLeftX = useRef(new Animated.Value(0)).current;
  const cloudRightX = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const splitDistance = SCREEN_W * 0.38;

    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(cloudLeftX, {
          toValue: -splitDistance,
          duration: 850,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cloudRightX, {
          toValue: splitDistance,
          duration: 850,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cloudCenterOpacity, {
          toValue: 0,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cloudLeftOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cloudRightOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.35,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [cloudCenterOpacity, cloudLeftOpacity, cloudRightOpacity, cloudLeftX, cloudRightX, logoOpacity]);

  return (
    <View style={styles.root}>
      <View style={styles.cloudStage}>
        <Animated.View
          style={[
            styles.cloudPair,
            {
              opacity: Animated.multiply(cloudCenterOpacity, cloudLeftOpacity),
              transform: [{ translateX: cloudLeftX }],
            },
          ]}
        >
          <Image source={SENGO_IMAGES.CLOUD} style={styles.cloudImg} resizeMode='contain' />
        </Animated.View>
        <Animated.View
          style={[
            styles.cloudPair,
            styles.cloudRightSlot,
            {
              opacity: Animated.multiply(cloudCenterOpacity, cloudRightOpacity),
              transform: [{ translateX: cloudRightX }],
            },
          ]}
        >
          <Image
            source={SENGO_IMAGES.CLOUD}
            style={[styles.cloudImg, styles.cloudMirrored]}
            resizeMode='contain'
          />
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity }]}
        pointerEvents='none'
      >
        <SvgComponent Svg={LogoSvg} svgWidth={LOGO_W} svgHeight={LOGO_H} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudStage: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: CLOUD_H + 8,
  },
  cloudPair: {
    width: CLOUD_W,
    height: CLOUD_H,
    marginHorizontal: -CLOUD_W * 0.12,
  },
  cloudRightSlot: {},
  cloudImg: {
    width: CLOUD_W,
    height: CLOUD_H,
  },
  cloudMirrored: {
    transform: [{ scaleX: -1 }],
  },
  logoWrap: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
