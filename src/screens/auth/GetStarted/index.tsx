import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Wrapper, Typography, SvgComponent, Button, Icon } from 'components/common';
import { screenHeight, screenWidth, COLORS, isIOS, BRAND_PRIMARY } from 'utils/index';
import { FontSize, FontWeight } from 'types/index';
import { SCREENS, SVG } from 'constants/index';
import type { SvgProps } from 'react-native-svg';
import { navigate } from 'navigation/index';
import { useDispatch } from 'react-redux';
import { setRole } from 'store/slices/user';
import { APP_CONFIG } from 'config/app';
import type { USER_TYPE } from 'types/auth';
import { useTranslation } from 'hooks/index';
import { AUTH_TEXT } from 'constants/screens';
import { VARIABLES } from 'constants/common';

/** Role picker screen background — matches brand secondary (XD). */
const ROLE_SCREEN_BLUE = '#004AAD';

type RoleTile = {
  role: USER_TYPE;
  label: string;
  Svg: React.FC<SvgProps>;
};

const ROLE_TILES: RoleTile[] = [
  { role: APP_CONFIG.USER_ROLE, label: APP_CONFIG.USER_ROLE_LABEL, Svg: SVG.ROLE_MAN },
  {
    role: APP_CONFIG.COURIER_ROLE,
    label: APP_CONFIG.COURIER_ROLE_LABEL,
    Svg: SVG.ROLE_CUSTOMER_SERVICE,
  },
  { role: APP_CONFIG.DRIVER_ROLE, label: APP_CONFIG.DRIVER_ROLE_LABEL, Svg: SVG.ROLE_DRIVER },
];

const WORDMARK_WIDTH = screenWidth(78);
const WORDMARK_HEIGHT = (WORDMARK_WIDTH * 69.794) / 219.578;

export const GetStarted = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<USER_TYPE | null>(null);

  const logoTranslateY = useRef(new Animated.Value(screenHeight(20))).current;
  const contentTranslateY = useRef(new Animated.Value(screenHeight(30))).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const logoAnimation = Animated.parallel([
      Animated.timing(logoTranslateY, {
        toValue: -screenHeight(0),
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

    const contentAnimation = Animated.parallel([
      Animated.timing(contentTranslateY, {
        toValue: 0,
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

    Animated.sequence([logoAnimation, Animated.delay(100), contentAnimation]).start();
  }, []);

  const goToLogin = () => {
    if (selectedRole == null) return;
    dispatch(setRole(selectedRole));
    navigate(SCREENS.LOGIN);
  };

  return (
    <Wrapper useScrollView={false} backgroundColor={ROLE_SCREEN_BLUE} useSafeArea={false} showBackButton={false}>
      <View style={[styles.container, { backgroundColor: ROLE_SCREEN_BLUE }]}>
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
            Svg={SVG.LOGO}
            svgWidth={WORDMARK_WIDTH}
            svgHeight={WORDMARK_HEIGHT}
            fill={COLORS.WHITE}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [{ translateY: contentTranslateY }],
              opacity: contentOpacity,
            },
          ]}
        >
          <View style={styles.textSection}>
            <Typography style={styles.mainTitle}>{t(AUTH_TEXT.GET_STARTED_HEADING)}</Typography>
            <Typography style={styles.description}>
              {t(AUTH_TEXT.GET_STARTED_DESCRIPTION)}
            </Typography>
          </View>

          <View style={styles.roleRow}>
            {ROLE_TILES.map(tile => {
              const selected = selectedRole === tile.role;
              return (
                <TouchableOpacity
                  key={tile.role}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                  onPress={() => setSelectedRole(tile.role)}
                  activeOpacity={0.85}
                >
                  {selected ? (
                    <View style={styles.checkBadge}>
                      <Icon
                        componentName={VARIABLES.Ionicons}
                        iconName='checkmark-circle'
                        size={26}
                        color={BRAND_PRIMARY}
                      />
                    </View>
                  ) : null}
                  <View style={styles.roleCardInner}>
                    {!selected ? <View style={styles.roleCardInnerOverlay} /> : null}
                    <SvgComponent Svg={tile.Svg} svgWidth={48} svgHeight={52} />
                    <Typography style={styles.roleLabel}>{tile.label}</Typography>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedRole != null ? (
            <View style={styles.continueWrap}>
              <Button
                title={t(AUTH_TEXT.GET_STARTED_CONTINUE)}
                style={styles.buttonContainer}
                onPress={goToLogin}
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: screenHeight(18),
    paddingHorizontal: 16,
    gap: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: screenHeight(2),
    marginBottom: screenHeight(isIOS() ? 2 : 3),
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: screenHeight(3),
    paddingHorizontal: 8,
  },
  mainTitle: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.WHITE,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  description: {
    color: COLORS.WHITE,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 10,
    lineHeight: 22,
    fontSize: FontSize.MediumSmall,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: screenHeight(2),
    paddingBottom: screenHeight(2),
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.MID_NIGHT_BLUE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND_PRIMARY,
    minHeight: screenHeight(14),
    overflow: 'hidden',
    position: 'relative',
  },
  roleCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 8,
    zIndex: 2,
  },
  roleCardInnerOverlay:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 25, 112, 0.6)',
    zIndex: 1,
  },
  roleCardSelected: {
    borderColor: BRAND_PRIMARY,
  },
  checkBadge: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 5,
    alignItems: 'flex-end',
    zIndex: 4,
    backgroundColor: 'transparent',
  },
  roleLabel: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
    textAlign: 'center',
  },
  continueWrap: {
    marginTop: screenHeight(2),
    paddingBottom: screenHeight(4),
  },
  buttonContainer: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: screenHeight(5),
  },
});
