import { Photo, RowComponent, SvgComponent, Typography, Wrapper } from 'components/common';
import { IMAGES, SVG } from 'constants/assets';
import { LANGUAGES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import { navigate, onBack } from 'navigation/Navigators';
import { ImageBackground, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ChildrenType, FontSize, FontWeight, StyleType, SvgNameType } from 'types/index';
import { screenWidth, FLEX_CENTER, COLORS, screenHeight } from 'utils/index';

type Props = {
  children: ChildrenType;
  heading1?: string;
  description?: string;
  showLogo?: boolean;
  bottomButtonText?: string;
  bottomText?: string;
  onBottomTextPress?: () => void;
  descriptionStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};
type SocialIconProps = {
  svgName: SvgNameType;
  buttonName: string;
  containerStyle?: StyleType;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
};

export const AuthComponent = ({
  children,
  heading1 = '',
  description = '',
  showLogo = true,
  descriptionStyle,
  containerStyle,
  bottomText = COMMON_TEXT.ALREADY_HAVE_AN_ACCOUNT,
  bottomButtonText = COMMON_TEXT.SIGN_IN,
  onBottomTextPress = () => {
    navigate(SCREENS.LOGIN);
  },
}: Props) => {
  return (
    <Wrapper useScrollView>
      {/* {showLogo && <Photo source={IMAGES.BACKGROUND_IMAGE} containerStyle={styles.logo} resizeMode='stretch'/>} */}
      <ImageBackground source={IMAGES.BACKGROUND_IMAGE} style={{height:290}} resizeMode='stretch'>
       <TouchableOpacity
  onPress={onBack}
  style={{
    height: 32,
    width: 32,
    backgroundColor: COLORS.WHITE,
    borderRadius: 4,
    marginVertical: 60,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <MaterialIcons
    name="arrow-back-ios"
    size={FontSize.Large}
    color={COLORS.BLACK}
    style={{
      transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }],marginStart:10
    }}
  />
</TouchableOpacity>

      </ImageBackground>
      <View style={[styles.container, containerStyle]}>
        <Typography style={styles.heading1}>{heading1}</Typography>
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
    // width: screenWidth(43),
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  bottomButtonTextStyle: {
    color: COLORS.PRIMARY,
    paddingVertical: 10,
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    top:-2
  },
  bottomTextStyle: {
    color: COLORS.MEDIUM_GREY,
    fontSize: FontSize.MediumLarge,
    fontWeight:'500'
  },
  textStyle: {
    fontSize: FontSize.Medium,
  },
  socialRow: {
    justifyContent: 'center',
    gap: 10,
  },
});
