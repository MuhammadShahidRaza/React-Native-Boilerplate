import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { SVG } from 'constants/assets';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SCREEN_DIAG = Math.sqrt(SCREEN_W * SCREEN_W + SCREEN_H * SCREEN_H);

/**
 * Circle diameter must be ≥ SCREEN_DIAG so its radius (= half diagonal)
 * reaches every corner of the screen from the centre point.
 * 1.05 adds a 5 % margin so no white bleeds through at the edges.
 */
const CIRCLE_BASE = SCREEN_DIAG * 1.05;

// Logo dimensions – 88 % of screen width, aspect-correct
const LOGO_SVG_ASPECT = 69.794 / 219.578;
const LOGO_W = SCREEN_W * 0.88;
const LOGO_H = LOGO_W * LOGO_SVG_ASPECT;

/**
 * Clip-window widths (percentages of LOGO_W).
 * Based on the SVG coordinate analysis:
 *   S  : 0 – 16 %   N : 21 – 41 %   Arrow : 34 – 50 %
 *   L  : 45 – 55 %  I : 57 – 63 %   F + T : 63 – 82 %
 * → SN_W ends just before L; L_W captures just the L letter.
 * Tune ± 0.01–0.02 if the exact device renders the cuts differently.
 */
const SN_W  = LOGO_W *  0.37;   // SN + arrow
const L_W   = LOGO_W * 0.19;   // L letter only
const IFT_W = LOGO_W - SN_W - L_W;

/**
 * Two decorative dots at the bottom of the logo (from SVG coordinate analysis):
 *   green dot  x ≈ 44.5 % of LOGO_W,  y ≈ 92.3 % of LOGO_H
 *   dark dot   x ≈ 53.0 % of LOGO_W,  y ≈ 92.3 % of LOGO_H
 *   radius     ≈ 2.5 % of LOGO_W
 */
const DOT_R       = LOGO_W * 0.025;
const GREEN_DOT_X = LOGO_W * 0.4453 - DOT_R;
const DARK_DOT_X  = LOGO_W * 0.5297 - DOT_R;
const DOT_Y       = LOGO_H * 0.923  - DOT_R;

const Logo = SVG.LOGO;

export const Splash = () => {
  const circleScale    = useRef(new Animated.Value(0)).current;
  const lOpacity       = useRef(new Animated.Value(0)).current;
  const lScale         = useRef(new Animated.Value(0.8)).current;
  const snTranslateX   = useRef(new Animated.Value(-SCREEN_W * 0.6)).current;
  const iftTranslateX  = useRef(new Animated.Value(SCREEN_W  * 0.6)).current;
  const snOpacity      = useRef(new Animated.Value(0)).current;
  const iftOpacity     = useRef(new Animated.Value(0)).current;
  // Dots slide from the outer screen edges to their resting positions
  const greenDotTX     = useRef(new Animated.Value(-SCREEN_W)).current;
  const darkDotTX      = useRef(new Animated.Value( SCREEN_W)).current;
  const dotOpacity     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      // 1. Blue circle expands to fill the whole screen
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 880,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(120),
      // 2. L appears in the centre
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
      // 3. SN slides from left, IFT from right, dots from both edges
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
        // Dots: fade in and slide from opposite screen edges
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
      {/* White underlay – the circle reveals the blue over this */}
      <View style={styles.whiteUnderlay} />

      {/* Blue circle – diameter = 1.05 × diagonal → covers every corner */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blueCircle,
          {
            width:        CIRCLE_BASE,
            height:       CIRCLE_BASE,
            borderRadius: CIRCLE_BASE / 2,
            transform: [{ scale: circleScale }],
          },
        ]}
      />

      {/* Logo + dots container – centred on screen */}
      <View style={styles.logoContainer}>
        {/* Three overflow-clipped logo sections in a row */}
        <View style={styles.logoRow}>
          {/* SN + arrow ── slides from left */}
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

          {/* L ── appears in centre */}
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

          {/* IFT ── slides from right */}
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

        {/*
         * Two decorative dots – rendered as absolute overlays so they can
         * slide independently from the screen edges to their resting positions.
         * The SVG already draws the dot shapes; these views sit on top and drive
         * the "from-edges" animation while the SVG dots are kept invisible
         * (they'd appear at the same spot if fill={COLORS.WHITE} weren't set).
         */}

        {/* Green dot – slides from left screen edge */}
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: BRAND_PRIMARY,
              width:  DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: DOT_R,
              left: GREEN_DOT_X,
              top:  DOT_Y,
            },
            { opacity: dotOpacity, transform: [{ translateX: greenDotTX }] },
          ]}
        />

        {/* White dot – slides from right screen edge */}
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: COLORS.WHITE,
              width:  DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: DOT_R,
              left: DARK_DOT_X,
              top:  DOT_Y,
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
    width:    LOGO_W,
    height:   LOGO_H,
    position: 'relative',
    zIndex:   2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    position:      'absolute',
    top:           0,
    left:          0,
  },
  clip: {
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
  },
});
