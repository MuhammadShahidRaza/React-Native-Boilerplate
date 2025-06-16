import { RowComponent, SvgComponent, Typography, Wrapper } from 'components/common';
import { SVG } from 'constants/assets';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import { reset } from 'navigation/Navigators';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ChildrenType, FontSize, FontWeight, StyleType, SvgNameType } from 'types/index';
import { screenWidth, FLEX_CENTER, COLORS, screenHeight, isIOS } from 'utils/index';

type Props = {
  children: ChildrenType;
  heading1?: string;
  description?: string;
  showLogo?: boolean;
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
  descriptionStyle,
  containerStyle,
  heading1Style,
  bottomText = COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT,
  bottomButtonText = COMMON_TEXT.SIGN_IN,
  onBottomTextPress = () => {
    reset(SCREENS.LOGIN);
  },
}: Props) => {
  return (
    <Wrapper useScrollView>
      {showLogo && <SvgComponent Svg={SVG.LOGO} containerStyle={styles.logo} />}
      <View style={[styles.container, containerStyle]}>
        {heading1 && <Typography style={[styles.heading1, heading1Style]}>{heading1}</Typography>}
        <Typography
          style={[styles.description, { marginBottom: description ? 20 : 5 }, descriptionStyle]}
        >
          {description}
        </Typography>
        {children}
      </View>
      <RowComponent style={styles.bottomText}>
        <Typography style={styles.bottomTextStyle}>{bottomText}</Typography>
        <Typography style={styles.bottomButtonTextStyle} onPress={onBottomTextPress}>
          {bottomButtonText}
        </Typography>
      </RowComponent>
    </Wrapper>
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
      <SvgComponent Svg={svgName} svgHeight={24} svgWidth={24} />
      <Typography style={[styles.textStyle, textStyle]}>{buttonName}</Typography>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  logo: {
    marginTop: screenHeight(5),
    ...FLEX_CENTER,
  },
  container: {
    marginHorizontal: 20,
    marginTop: 40,
    // minHeight: screenHeight(isIOS() ? 62 : 70),
  },
  heading1: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
  },
  bottomText: {
    ...FLEX_CENTER,
    gap: 6,
    paddingBottom: 20,
  },
  description: {
    fontSize: FontSize.Medium,
    marginTop: 8,
    textAlign: 'center',

    marginBottom: 20,
    color: COLORS.MEDIUM_GREY,
  },
  socialLogin: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: screenWidth(43),
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bottomButtonTextStyle: {
    color: COLORS.SECONDARY,
    paddingVertical: 10,
    textDecorationLine: 'underline',
    fontSize: FontSize.Medium,
    marginBottom: isIOS() ? 0 : 5,
    fontWeight: FontWeight.Bold,
  },
  bottomTextStyle: {
    color: COLORS.MEDIUM_GREY,
    fontSize: FontSize.Medium,
  },
  textStyle: {
    fontSize: FontSize.Medium,
  },
  socialRow: {
    justifyContent: 'center',
    gap: 10,
  },
});
