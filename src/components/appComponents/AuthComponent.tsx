import { RowComponent, SvgComponent, Typography, Wrapper } from 'components/common';
import { getBrandLogoAspect, getBrandLogoSvg, isSengoBrand } from 'constants/assets/brandLogo';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import { reset } from 'navigation/Navigators';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChildrenType, FontSize, FontWeight, StyleType, SvgNameType } from 'types/index';
import { screenWidth, screenHeight, FLEX_CENTER, COLORS } from 'utils/index';

type Props = {
  children: ChildrenType;
  heading1?: string;
  description?: string;
  showLogo?: boolean;
  showBack?: boolean;
  bottomButtonText?: string;
  bottomText?: string;
  onBottomTextPress?: () => void;
  descriptionStyle?: StyleProp<TextStyle>;
  heading1Style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};
type SocialIconProps = {
  svgName: SvgNameType;
  buttonName: string;
  containerStyle?: StyleType;
  textStyle?: StyleProp<TextStyle>;
  heading1Style?: StyleProp<TextStyle>;
  onPress: () => void;
};

export const AuthComponent = ({
  children,
  heading1 = '',
  description = '',
  showLogo = true,
  showBack = true,
  descriptionStyle,
  containerStyle,
  heading1Style,
  bottomText = COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT,
  bottomButtonText = COMMON_TEXT.SIGN_IN,
  onBottomTextPress = () => {
    reset(SCREENS.LOGIN);
  },
}: Props) => {
  const showBottomSection = Boolean(bottomText || bottomButtonText);
  const insets = useSafeAreaInsets();
  const logoWidth = screenWidth(isSengoBrand() ? 45 : 55);
  const logoHeight = logoWidth * getBrandLogoAspect('light');
  const BrandLogo = getBrandLogoSvg('light');

  return (
    <>
      <Wrapper useScrollView showBackButton={showBack}>
        <View style={styles.mainContainer}>
          {showLogo && (
            <SvgComponent
              Svg={BrandLogo}
              containerStyle={styles.logo}
              svgWidth={logoWidth}
              svgHeight={logoHeight}
              {...(isSengoBrand() ? {} : { fill: COLORS.APP_ICON })}
            />
          )}
          <View style={[styles.container, containerStyle]}>
            {heading1 && (
              <Typography style={[styles.heading1, heading1Style]}>{heading1}</Typography>
            )}
            <Typography
              style={[styles.description, { marginBottom: description ? 20 : 5 }, descriptionStyle]}
            >
              {description}
            </Typography>
            {children}
          </View>
        </View>
      </Wrapper>

      {showBottomSection && (
        <RowComponent style={[styles.bottomText, { paddingBottom: insets.bottom + 10 }]}>
          <Typography style={styles.bottomTextStyle}>{bottomText}</Typography>
          <Typography style={styles.bottomButtonTextStyle} onPress={onBottomTextPress}>
            {bottomButtonText}
          </Typography>
        </RowComponent>
      )}
    </>
  );
};

export const SocialButton = ({
  svgName,
  buttonName,
  containerStyle,
  textStyle,
  onPress,
}: SocialIconProps) => {
  return (
    <RowComponent onPress={onPress} style={[styles.socialLogin, containerStyle]}>
      <SvgComponent Svg={svgName} svgHeight={24} svgWidth={24} fill={COLORS.TEXT} />
      <Typography style={[styles.textStyle, textStyle]}>{buttonName}</Typography>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  logo: {
    marginTop: screenHeight(1),
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  container: {
    marginHorizontal: 20,
    marginTop: screenHeight(4),
    // minHeight: screenHeight(isIOS() ? 62 : 70),
  },
  heading1: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.SemiBold,
  },
  bottomText: {
    backgroundColor: COLORS.BACKGROUND,
    ...FLEX_CENTER,
    gap: 6,
    paddingVertical: 20,
  },
  description: {
    fontSize: FontSize.Small,
    marginTop: 2,
    marginBottom: 20,
    color: COLORS.TEXT_SECONDARY,
  },
  socialLogin: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: screenWidth(90),
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  iconStyle: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 20,
    alignSelf: 'flex-start',
  },
  bottomButtonTextStyle: {
    color: COLORS.PRIMARY,
    paddingVertical: 10,
    // textDecorationLine: 'underline',
    // marginBottom: isIOS() ? 0 : 5,
    // fontWeight: FontWeight.Bold,
  },
  bottomTextStyle: {
    color: COLORS.TEXT_SECONDARY,
  },
  textStyle: {},
  socialRow: {
    justifyContent: 'center',
    gap: 10,
  },
});
