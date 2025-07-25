import { Text, TextProps, TextStyle } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS } from 'utils/colors';
import { StyleProp } from 'react-native';
import { FONT_FAMILY } from 'constants/assets/fonts';
import { useTranslation } from 'hooks/index';

// type TextStyleWithoutTheseProperties = Omit<TextStyle, 'fontSize'>;

interface Props extends TextProps {
  children: string | undefined;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
  fontSize?: FontSize;
  color?: string;
  fontWeight?: FontWeight;
  italic?: boolean;
  underline?: boolean;
  translate?: boolean;
  lineHeight?: number;
}

export const Typography: React.FC<Props> = ({
  children,
  style,
  fontSize,
  color,
  fontWeight,
  italic,
  underline,
  lineHeight,
  onPress,
  translate = true,
  ...restProps
}) => {
  const { isLangRTL, t } = useTranslation();

  function AddfontFamily() {
    const weight = (style && (style as TextStyle).fontWeight) ?? fontWeight;
    switch (weight) {
      case FontWeight.Light:
        return FONT_FAMILY.GORDITA.LIGHT;
      case FontWeight.Black:
        return FONT_FAMILY.GORDITA.BLACK;
      case FontWeight.Bold:
        return FONT_FAMILY.POPPINS.BOLD;
      case FontWeight.SemiBold:
      case FontWeight.Medium:
        return FONT_FAMILY.POPPINS.MEDIUM;
      default:
        return FONT_FAMILY.POPPINS.REGULAR;
    }
  }

  const textStyle: TextStyle = {
    ...(!isLangRTL && { fontFamily: AddfontFamily() }),
    fontSize: fontSize || FontSize.Medium,
    color: color || COLORS.BLACK,
    fontWeight: fontWeight || 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    textDecorationLine: underline ? 'underline' : 'none',
    lineHeight: lineHeight || undefined,
    writingDirection: isLangRTL ? 'rtl' : 'ltr',
  };

  return (
    <Text onPress={onPress} style={[textStyle, style]} {...restProps}>
      {translate ? t(children ?? '') : children}
    </Text>
  );
};

// import { Text, TextProps, TextStyle } from 'react-native';
// import { FontSize, FontWeight } from 'types/index';
// import { COLORS } from 'utils/colors';
// import { StyleProp } from 'react-native';
// import { FONT_FAMILY } from 'constants/assets/fonts';
// import { useTranslation } from 'hooks/index';
// import { openEmail, openPhoneNumber, openUrl } from 'utils/linking';
// import { REGEX } from 'utils/regex';

// interface Props extends TextProps {
//   children: string | undefined;
//   onPress?: () => void;
//   style?: StyleProp<TextStyle>;
//   fontSize?: FontSize;
//   color?: string;
//   fontWeight?: FontWeight;
//   italic?: boolean;
//   underline?: boolean;
//   lineHeight?: number;
// }

// export const Typography: React.FC<Props> = ({
//   children,
//   style,
//   fontSize,
//   color,
//   fontWeight,
//   italic,
//   underline,
//   lineHeight,
//   onPress,
//   ...restProps
// }) => {
//   const { isLangRTL, t } = useTranslation();
//   const value = typeof children === 'string' ? children : String(children);
//   const isUrl = REGEX.URL.test(value);
//   const isEmail = REGEX.EMAIL.test(value);
//   const isPhoneNumber = REGEX.PHONE_NUMBER.test(value);
//   const isLink = isUrl || isPhoneNumber || isEmail;

//   function AddfontFamily() {
//     const weight = (style && (style as TextStyle).fontWeight) ?? fontWeight;
//     switch (weight) {
//       case FontWeight.Light:
//         return FONT_FAMILY.GORDITA.LIGHT;
//       case FontWeight.Black:
//         return FONT_FAMILY.GORDITA.BLACK;
//       case FontWeight.Bold:
//         return FONT_FAMILY.POPPINS.BOLD;
//       case FontWeight.SemiBold:
//       case FontWeight.Medium:
//         return FONT_FAMILY.POPPINS.MEDIUM;
//       default:
//         return FONT_FAMILY.POPPINS.REGULAR;
//     }
//   }

//   const textStyle: TextStyle = {
//     ...(!isLangRTL && { fontFamily: AddfontFamily() }),
//     fontSize: fontSize || FontSize.Medium,
//     color: color || COLORS.BLACK,
//     fontWeight: fontWeight || 'normal',
//     fontStyle: italic ? 'italic' : 'normal',
//     textDecorationLine: underline ? 'underline' : 'none',
//     lineHeight: lineHeight || undefined,
//     writingDirection: isLangRTL ? 'rtl' : 'ltr',
//   };

//   const handlePress = () => {
//     if (isUrl) {
//       openUrl(value);
//     } else if (isEmail) {
//       openEmail(value);
//     } else if (isPhoneNumber) {
//       openPhoneNumber(value);
//     }
//   };
//   return (
//     <Text onPress={isLink ? handlePress : onPress} style={[textStyle, style]} {...restProps}>
//       {isLink ? value : t(value)}
//     </Text>
//   );
// };
