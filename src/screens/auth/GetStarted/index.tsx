import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Wrapper, Typography, Photo, SvgComponent } from 'components/common';
import { screenHeight, screenWidth, COLORS, isIOS } from 'utils/index';
import { FontSize, FontWeight } from 'types/index';
import { IMAGES, SCREENS, SVG } from 'constants/index';
import { navigate } from 'navigation/index';
import { useDispatch } from 'react-redux';
import { setRole } from 'store/slices/user';
import { useEffect, useRef } from 'react';

export const GetStarted = () => {
  const dispatch = useDispatch();

  // Animation values
  const logoTranslateY = useRef(new Animated.Value(screenHeight(20))).current; // Start at center (0)
  const contentTranslateY = useRef(new Animated.Value(screenHeight(30))).current; // Start below screen
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation: moves from center to top
    const logoAnimation = Animated.parallel([
      Animated.timing(logoTranslateY, {
        toValue: -screenHeight(0), // Move up to top
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    // Content animation: moves from bottom to center (with slight delay)
    const contentAnimation = Animated.parallel([
      Animated.timing(contentTranslateY, {
        toValue: 0, // Move to final position
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    // Start logo animation first, then content after a short delay
    Animated.sequence([
      logoAnimation,
      Animated.delay(100), // Small delay between animations
      contentAnimation,
    ]).start();
  }, []);

  const handleUserPress = () => {
    // Navigate to user login
    dispatch(setRole('user'));
    navigate(SCREENS.LOGIN);
  };

  const handleDentorPress = () => {
    // Navigate to dentor login
    dispatch(setRole('dentor'));
    navigate(SCREENS.LOGIN);
  };

  return (
    <Wrapper useScrollView={false} useSafeArea={false} showBackButton={false}>
      <View style={styles.container}>
        {/* Logo Section - Animated */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              transform: [{ translateY: logoTranslateY }],
              opacity: logoOpacity,
            },
          ]}
        >
          <SvgComponent
            Svg={SVG.LOGO_WITH_NAME}
            svgHeight={screenHeight(20)}
            svgWidth={screenWidth(50)}
            fill={COLORS.APP_ICON}
          />
        </Animated.View>

        {/* Marketing Text Section & Buttons - Animated */}
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [{ translateY: contentTranslateY }],
              opacity: contentOpacity,
            },
          ]}
        >
          {/* Marketing Text Section */}
          <View style={styles.textSection}>
            <Typography style={styles.mainTitle}>Fix Car Dents Instantly</Typography>
            <Typography style={styles.description}>
              Upload a photo of your car dent and get repair quotes from nearby experts within
              minutes.
            </Typography>
          </View>

          {/* Role Selection Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity
              style={styles.userButton}
              onPress={handleUserPress}
              activeOpacity={0.8}
            >
              <View style={{ width: screenWidth(10) }} />
              <Typography style={styles.userButtonText}>User</Typography>
              <Photo source={IMAGES.USER_ICON} disabled imageStyle={styles.buttonIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dentorButton}
              onPress={handleDentorPress}
              activeOpacity={0.8}
            >
              <View style={{ width: screenWidth(10) }} />

              <Typography style={styles.dentorButtonText}>Dent Technician</Typography>
              <Photo source={IMAGES.DENTOR} disabled imageStyle={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Car Image at Bottom */}
        {/* <AnimatedCar duration={3000}
          containerStyle={{ bottom: -40 }}
        /> */}
        <Photo source={IMAGES.CAR} imageStyle={styles.carImage} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: screenHeight(7),
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: screenHeight(2),
    marginBottom: screenHeight(isIOS() ? 3 : 4),
  },
  contentWrapper: {
    flex: 1,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: screenHeight(3),
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  description: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonsSection: {
    gap: 16,
    marginBottom: screenHeight(4),
  },
  userButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 55,
  },
  userButtonText: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
    textAlign: 'center',
  },
  dentorButton: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    minHeight: 55,
  },
  dentorButtonText: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  buttonIcon: {
    width: 30,
    height: 30,
    flex: 1,
    resizeMode: 'contain',
  },
  carImage: {
    width: screenWidth(90),
    marginLeft: screenWidth(-20),
    height: screenHeight(25),
    resizeMode: 'contain',
  },
});
