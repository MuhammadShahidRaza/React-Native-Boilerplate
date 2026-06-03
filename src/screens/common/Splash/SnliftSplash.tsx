import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { SVG } from 'constants/assets';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SCREEN_DIAG = Math.sqrt(SCREEN_W * SCREEN_W + SCREEN_H * SCREEN_H);
const CIRCLE_BASE = SCREEN_DIAG * 1.05;
const LOGO_SVG_ASPECT = 69.794 / 219.578;
const LOGO_W = SCREEN_W * 0.88;
const LOGO_H = LOGO_W * LOGO_SVG_ASPECT;
const SN_W = LOGO_W * 0.37;
const L_W = LOGO_W * 0.19;
const IFT_W = LOGO_W - SN_W - L_W;
const DOT_R = LOGO_W * 0.025;
const GREEN_DOT_X = LOGO_W * 0.4453 - DOT_R;
const DARK_DOT_X = LOGO_W * 0.5297 - DOT_R;
const DOT_Y = LOGO_H * 0.923 - DOT_R;
const Logo = SVG.LOGO;

/** SN Lift branded splash (snlift only). */
export const SnliftSplash = () => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const lOpacity = useRef(new Animated.Value(0)).current;
  const lScale = useRef(new Animated.Value(0.8)).current;
  const snTranslateX = useRef(new Animated.Value(-SCREEN_W * 0.6)).current;
  const iftTranslateX = useRef(new Animated.Value(SCREEN_W * 0.6)).current;
  const snOpacity = useRef(new Animated.Value(0)).current;
  const iftOpacity = useRef(new Animated.Value(0)).current;
  const greenDotTX = useRef(new Animated.Value(-SCREEN_W)).current;
  const darkDotTX = useRef(new Animated.Value(SCREEN_W)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 880,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(lOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(lScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(140),
      Animated.parallel([
        Animated.timing(snTranslateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(iftTranslateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(snOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iftOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greenDotTX, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(darkDotTX, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    circleScale,
    lOpacity,
    lScale,
    snTranslateX,
    iftTranslateX,
    snOpacity,
    iftOpacity,
    greenDotTX,
    darkDotTX,
    dotOpacity,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.whiteUnderlay} />
      <Animated.View
        pointerEvents='none'
        style={[
          styles.blueCircle,
          {
            width: CIRCLE_BASE,
            height: CIRCLE_BASE,
            borderRadius: CIRCLE_BASE / 2,
            transform: [{ scale: circleScale }],
          },
        ]}
      />
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Animated.View
            style={[
              styles.clip,
              { width: SN_W, height: LOGO_H },
              { opacity: snOpacity, transform: [{ translateX: snTranslateX }] },
            ]}
          >
            <View style={{ position: 'absolute', left: 0, top: 0 }}>
              <Logo width={LOGO_W} height={LOGO_H} fill={COLORS.WHITE} />
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.clip,
              { width: L_W, height: LOGO_H },
              { opacity: lOpacity, transform: [{ scale: lScale }] },
            ]}
          >
            <View style={{ position: 'absolute', left: -SN_W, top: 0 }}>
              <Logo width={LOGO_W} height={LOGO_H} fill={COLORS.WHITE} />
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.clip,
              { width: IFT_W, height: LOGO_H },
              { opacity: iftOpacity, transform: [{ translateX: iftTranslateX }] },
            ]}
          >
            <View style={{ position: 'absolute', left: -(SN_W + L_W), top: 0 }}>
              <Logo width={LOGO_W} height={LOGO_H} fill={COLORS.WHITE} />
            </View>
          </Animated.View>
        </View>
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: BRAND_PRIMARY,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: DOT_R,
              left: GREEN_DOT_X,
              top: DOT_Y,
            },
            { opacity: dotOpacity, transform: [{ translateX: greenDotTX }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: COLORS.WHITE,
              width: DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: DOT_R,
              left: DARK_DOT_X,
              top: DOT_Y,
            },
            { opacity: dotOpacity, transform: [{ translateX: darkDotTX }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteUnderlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.WHITE,
  },
  blueCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: SCREEN_H / 2 - CIRCLE_BASE / 2,
    backgroundColor: BRAND_SECONDARY,
  },
  logoContainer: {
    width: LOGO_W,
    height: LOGO_H,
    position: 'relative',
    zIndex: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  clip: {
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
  },
});
