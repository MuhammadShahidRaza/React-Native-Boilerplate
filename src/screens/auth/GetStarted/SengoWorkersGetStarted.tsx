import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Wrapper, Typography, SvgComponent } from 'components/common';
import { screenHeight, screenWidth, COLORS, STYLES } from 'utils/index';
import { FontSize, FontWeight } from 'types/index';
import { getBrandLogoAspect, getBrandLogoSvg } from 'constants/assets/brandLogo';
import { SCREENS, SVG } from 'constants/index';
import type { SvgProps } from 'react-native-svg';
import { navigate } from 'navigation/index';
import { useDispatch } from 'react-redux';
import { setRole } from 'store/slices/user';
import { APP_CONFIG } from 'config/app';
import { VARIANT } from 'config/variant';
import type { USER_TYPE } from 'types/auth';
import { useTranslation } from 'hooks/index';
import { AUTH_TEXT } from 'constants/screens';

type WorkerRoleTile = {
  role: USER_TYPE;
  label: string;
  Svg: React.FC<SvgProps>;
};

const WORKER_ROLE_TILES: WorkerRoleTile[] = [
  {
    role: APP_CONFIG.COURIER_ROLE,
    label: 'Parcel Rider',
    Svg: SVG.ROLE_CUSTOMER_SERVICE,
  },
  {
    role: APP_CONFIG.DRIVER_ROLE,
    label: 'Taxi Driver',
    Svg: SVG.ROLE_DRIVER,
  },
];

const WORDMARK_WIDTH = screenWidth(58);
const WORDMARK_HEIGHT = WORDMARK_WIDTH * getBrandLogoAspect('light');
const BrandLogo = getBrandLogoSvg('light');

/** Sengo Workers — white role picker (Figma). */
export const SengoWorkersGetStarted = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<USER_TYPE | null>(null);

  const pickRole = (role: USER_TYPE) => {
    setSelectedRole(role);
    dispatch(setRole(role));
    navigate(SCREENS.LOGIN);
  };

  return (
    <Wrapper
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      useSafeArea
      showBackButton={false}
      darkMode={false}
    >
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <SvgComponent
            Svg={BrandLogo}
            svgWidth={WORDMARK_WIDTH}
            svgHeight={WORDMARK_HEIGHT}
          />
        </View>

        <View style={styles.textSection}>
          <Typography style={styles.mainTitle}>{t(AUTH_TEXT.GET_STARTED_HEADING)}</Typography>
          <Typography style={styles.description}>
            {t(VARIANT.getStartedDescriptionKey)}
          </Typography>
        </View>

        <View style={styles.roleList}>
          {WORKER_ROLE_TILES.map(tile => {
            const selected = selectedRole === tile.role;
            return (
              <Pressable
                key={tile.role}
                style={[styles.rolePill, selected && styles.rolePillSelected]}
                onPress={() => pickRole(tile.role)}
              >
                <View style={styles.iconCircle}>
                  <SvgComponent Svg={tile.Svg} svgWidth={40} svgHeight={44} />
                </View>
                <Typography style={styles.roleLabel}>{tile.label}</Typography>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: screenHeight(4),
    paddingBottom: screenHeight(6),
  },
  logoSection: {
    alignItems: 'center',
    marginTop: screenHeight(6),
    marginBottom: screenHeight(4),
  },
  textSection: {
    alignItems: 'center',
    marginBottom: screenHeight(4),
    paddingHorizontal: 4,
  },
  mainTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  description: {
    color: COLORS.DARK_GREY,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontSize: FontSize.MediumSmall,
    paddingHorizontal: 8,
  },
  roleList: {
    gap: 16,
    marginTop: screenHeight(2),
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GREY,
    paddingVertical: 14,
    paddingHorizontal: 18,
    ...STYLES.SHADOW,
  },
  rolePillSelected: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GREY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: COLORS.WHITE,
  },
  roleLabel: {
    flex: 1,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.MEDIUM_GREY,
  },
});
