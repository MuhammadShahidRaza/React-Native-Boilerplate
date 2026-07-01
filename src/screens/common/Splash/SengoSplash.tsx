import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgComponent } from 'components/common';
import { getBrandLogoAspect, getBrandLogoSvg } from 'constants/assets/brandLogo';
import { SENGO_IMAGES, SENGO_VIDEOS } from 'constants/assets/variantImages';
import { COLORS, screenHeight, screenWidth } from 'utils/index';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_W = SCREEN_W * 0.72;
const LOGO_H = LOGO_W * getBrandLogoAspect('light');
const CLOUD_W = screenWidth(58);
const CLOUD_H = screenWidth(55);
const CLOUD_EDGE_INSET = screenWidth(-20);
const VIDEO_W = screenWidth(100);
const VIDEO_H = VIDEO_W * (9 / 16);
const LogoSvg = getBrandLogoSvg('light');

/** Left cloud: off-screen left → right edge. */
const CLOUD_FROM_LEFT_START = -CLOUD_W + CLOUD_EDGE_INSET;
const CLOUD_FROM_LEFT_END = SCREEN_W - CLOUD_W - CLOUD_EDGE_INSET;
/** Right cloud: off-screen right → left edge. */
const CLOUD_FROM_RIGHT_START = SCREEN_W - CLOUD_EDGE_INSET;
const CLOUD_FROM_RIGHT_END = CLOUD_EDGE_INSET;

const SPLASH_MOTION_MS = 2600;
const LOGO_FADE_MS = 500;
const LOGO_SCALE_START = 1.48;
const LOGO_SCALE_END = 1;

/** Sengo splash: clouds cross (L→R, R→L); logo center; video at bottom. */
export const SengoSplash = () => {
  const insets = useSafeAreaInsets();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const cloudLeftX = useRef(new Animated.Value(CLOUD_FROM_LEFT_START)).current;
  const cloudRightX = useRef(new Animated.Value(CLOUD_FROM_RIGHT_START)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(LOGO_SCALE_START)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: LOGO_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: LOGO_SCALE_END,
        duration: SPLASH_MOTION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cloudLeftX, {
        toValue: CLOUD_FROM_LEFT_END,
        duration: SPLASH_MOTION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cloudRightX, {
        toValue: CLOUD_FROM_RIGHT_END,
        duration: SPLASH_MOTION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cloudLeftX, cloudRightX, logoOpacity, logoScale]);

  const startVideo = () => {
    setVideoPlaying(true);
  };

  const revealVideo = () => {
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.root}>
      <View style={styles.cloudStage} pointerEvents='none'>
        <Animated.View style={[styles.cloudSlot, { transform: [{ translateX: cloudLeftX }] }]}>
          <Image source={SENGO_IMAGES.CLOUD} style={styles.cloudImg} resizeMode='contain' />
        </Animated.View>
        <Animated.View style={[styles.cloudSlot, { transform: [{ translateX: cloudRightX }] }]}>
          <Image
            source={SENGO_IMAGES.CLOUD}
            style={[styles.cloudImg, styles.cloudMirrored]}
            resizeMode='contain'
          />
        </Animated.View>
      </View>

      <View style={styles.logoArea}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          pointerEvents='none'
        >
          <SvgComponent Svg={LogoSvg} svgWidth={LOGO_W} svgHeight={LOGO_H} />
        </Animated.View>
      </View>

      <View style={[styles.videoBottom, { paddingBottom: insets.bottom }]}>
        <Animated.View style={[styles.video, { opacity: videoOpacity }]}>
          <Video
            source={SENGO_VIDEOS.SPLASH_DELIVERY}
            style={styles.video}
            resizeMode='cover'
            repeat
            muted
            paused={!videoPlaying}
            controls={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch='ignore'
            mixWithOthers='mix'
            onLoad={startVideo}
            onReadyForDisplay={revealVideo}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  cloudStage: {
    position: 'absolute',
    top: '8%',
    left: 0,
    width: SCREEN_W,
    height: CLOUD_H,
    zIndex: 3,
    overflow: 'visible',
  },
  cloudSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CLOUD_W,
    height: CLOUD_H,
  },
  cloudImg: {
    width: CLOUD_W,
    height: CLOUD_H,
  },
  cloudMirrored: {
    transform: [{ scaleX: -1 }],
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: screenHeight(8),
    paddingBottom: VIDEO_H + screenHeight(4),
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_W,
    height: VIDEO_H,
    backgroundColor: COLORS.WHITE,
  },
  video: {
    width: VIDEO_W,
    height: VIDEO_H,
    alignSelf: 'center',
  },
});
