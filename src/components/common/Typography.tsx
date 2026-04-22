import { useMemo } from 'react';
import { Text, TextProps, TextStyle, StyleProp, Platform, PixelRatio } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS } from 'utils/colors';
import { FONT_FAMILY } from 'constants/assets/fonts';
import { useTranslation } from 'hooks/index';

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

// Constants
// Platform-specific font scaling factors
// Android devices, especially Chinese ones, often have larger default font sizes
const ANDROID_FONT_SCALE_FACTOR = 0.72; // More aggressive scaling for Android
// const IOS_FONT_SCALE_FACTOR = 0.9; // Less aggressive for iOS
const IOS_FONT_SCALE_FACTOR = 0.88; //  0.85; // Less aggressive for iOS
const DEFAULT_FONT_SIZE = FontSize.Medium;

/**
 * Get platform-specific font scale factor
 * Also considers PixelRatio for high-density screens
 */
const getFontScaleFactor = (): number => {
  if (Platform.OS === 'android') {
    const pixelRatio = PixelRatio.get();
    // For high-density Android screens (common in Chinese devices), apply even more scaling
    if (pixelRatio >= 3) {
      return 0.75; // Extra scaling for high-density screens
    }
    return ANDROID_FONT_SCALE_FACTOR;
  }
  return IOS_FONT_SCALE_FACTOR;
};

// Font weight mapping
const FONT_WEIGHT_MAP: Record<string, FontWeight> = {
  '300': FontWeight.Light,
  '500': FontWeight.Medium,
  '600': FontWeight.SemiBold,
  '700': FontWeight.Bold,
  '900': FontWeight.Black,
  light: FontWeight.Light,
  medium: FontWeight.Medium,
  semibold: FontWeight.SemiBold,
  bold: FontWeight.Bold,
  black: FontWeight.Black,
};

// Font family mapping
const FONT_FAMILY_MAP: Record<FontWeight, string> = {
  [FontWeight.Light]: FONT_FAMILY.GORDITA.LIGHT,
  [FontWeight.Black]: FONT_FAMILY.GORDITA.BLACK,
  [FontWeight.Bold]: FONT_FAMILY.POPPINS.BOLD,
  [FontWeight.SemiBold]: FONT_FAMILY.POPPINS.SEMIBOLD,
  [FontWeight.Medium]: FONT_FAMILY.POPPINS.MEDIUM,
  [FontWeight.Normal]: FONT_FAMILY.POPPINS.REGULAR,
  [FontWeight.Thin]: FONT_FAMILY.POPPINS.REGULAR,
  [FontWeight.ExtraLight]: FONT_FAMILY.POPPINS.REGULAR,
  [FontWeight.ExtraBold]: FONT_FAMILY.POPPINS.BOLD,
};

/**
 * Normalize font weight to FontWeight enum
 */
const normalizeFontWeight = (weight: any): FontWeight => {
  if (!weight || weight === false || weight === '') return FontWeight.Normal;

  if (Object.values(FontWeight).includes(weight as FontWeight)) {
    return weight as FontWeight;
  }

  if (typeof weight === 'string') {
    const weightKey = weight.toLowerCase();
    return FONT_WEIGHT_MAP[weightKey] || FontWeight.Normal;
  }

  if (typeof weight === 'number') {
    return FONT_WEIGHT_MAP[String(weight)] || FontWeight.Normal;
  }

  return FontWeight.Normal;
};

/**
 * Typography component with responsive font sizing and proper font family selection
 */
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

  // Flatten style prop (can be array, object, or number)
  const flattenedStyle = useMemo(() => {
    if (!style) return null;
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    if (typeof style === 'object') {
      return style;
    }
    return null;
  }, [style]);

  // Get weight from style or prop
  const styleWeight = flattenedStyle?.fontWeight;
  const finalWeight = styleWeight ?? fontWeight;
  const normalizedWeight = normalizeFontWeight(finalWeight);

  // Get font family based on weight
  const fontFamily = useMemo(() => {
    return FONT_FAMILY_MAP[normalizedWeight] || FONT_FAMILY.POPPINS.REGULAR;
  }, [normalizedWeight]);

  // Get font size from style or prop, then make responsive based on platform
  const calculatedFontSize = useMemo(() => {
    const sizeFromStyle = flattenedStyle?.fontSize;
    const finalSize = sizeFromStyle ?? fontSize ?? DEFAULT_FONT_SIZE;
    const scaleFactor = getFontScaleFactor();

    if (typeof finalSize === 'number') {
      return Math.round(finalSize * scaleFactor);
    }

    return Math.round(DEFAULT_FONT_SIZE * scaleFactor);
  }, [flattenedStyle, fontSize]);

  // Get color - prioritize prop, then style, then default
  const textColor = useMemo(() => {
    return color || flattenedStyle?.color || COLORS.TEXT;
  }, [color, flattenedStyle]);

  // Build base text style
  const baseTextStyle: TextStyle = useMemo(
    () => ({
      ...(!isLangRTL && { fontFamily }),
      fontSize: calculatedFontSize,
      color: textColor,
      fontWeight: 'normal', // Always normal when using custom fonts
      fontStyle: italic ? 'italic' : 'normal',
      textDecorationLine: underline ? 'underline' : 'none',
      lineHeight: lineHeight || undefined,
      writingDirection: isLangRTL ? 'rtl' : 'ltr',
    }),
    [isLangRTL, fontFamily, calculatedFontSize, textColor, italic, underline, lineHeight],
  );

  // Merge styles: base style first, then custom style (but exclude fontSize, fontWeight, and color to prevent conflicts)
  const mergedStyle = useMemo(() => {
    if (!flattenedStyle) return baseTextStyle;

    // Extract conflicting properties and keep the rest
    const { fontSize: _, fontWeight: __, color: ___, ...restStyle } = flattenedStyle;

    // Return array so React Native can properly merge styles
    return [baseTextStyle, restStyle];
  }, [baseTextStyle, flattenedStyle]);

  const displayText = translate ? t(children ?? '') : children;

  return (
    <Text
      onPress={onPress}
      style={mergedStyle}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...restProps}
    >
      {displayText}
    </Text>
  );
};

//TODO: RESPONSIVE FONTS ACCRODING TO DEVICE SIZE HANDLED IN THIS

// import { useMemo } from 'react';
// import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
// import { FontSize, FontWeight } from 'types/index';
// import { COLORS } from 'utils/colors';
// import { FONT_FAMILY } from 'constants/assets/fonts';
// import { useTranslation } from 'hooks/index';
// import { getResponsiveFontSize } from 'utils/helpers';

// interface Props extends TextProps {
//   children: string | undefined;
//   onPress?: () => void;
//   style?: StyleProp<TextStyle>;
//   fontSize?: FontSize;
//   color?: string;
//   fontWeight?: FontWeight;
//   italic?: boolean;
//   underline?: boolean;
//   translate?: boolean;
//   lineHeight?: number;
// }

// // Constants
// const DEFAULT_FONT_SIZE = FontSize.Medium;

// // Font weight mapping
// const FONT_WEIGHT_MAP: Record<string, FontWeight> = {
//   '300': FontWeight.Light,
//   '500': FontWeight.Medium,
//   '600': FontWeight.SemiBold,
//   '700': FontWeight.Bold,
//   '900': FontWeight.Black,
//   light: FontWeight.Light,
//   medium: FontWeight.Medium,
//   semibold: FontWeight.SemiBold,
//   bold: FontWeight.Bold,
//   black: FontWeight.Black,
// };

// // Font family mapping
// const FONT_FAMILY_MAP: Record<FontWeight, string> = {
//   [FontWeight.Light]: FONT_FAMILY.GORDITA.LIGHT,
//   [FontWeight.Black]: FONT_FAMILY.GORDITA.BLACK,
//   [FontWeight.Bold]: FONT_FAMILY.POPPINS.BOLD,
//   [FontWeight.SemiBold]: FONT_FAMILY.POPPINS.SEMIBOLD,
//   [FontWeight.Medium]: FONT_FAMILY.POPPINS.MEDIUM,
//   [FontWeight.Normal]: FONT_FAMILY.POPPINS.REGULAR,
//   [FontWeight.Thin]: FONT_FAMILY.POPPINS.REGULAR,
//   [FontWeight.ExtraLight]: FONT_FAMILY.POPPINS.REGULAR,
//   [FontWeight.ExtraBold]: FONT_FAMILY.POPPINS.BOLD,
// };

// /**
//  * Normalize font weight to FontWeight enum
//  */
// const normalizeFontWeight = (weight: any): FontWeight => {
//   if (!weight || weight === false || weight === '') return FontWeight.Normal;

//   if (Object.values(FontWeight).includes(weight as FontWeight)) {
//     return weight as FontWeight;
//   }

//   if (typeof weight === 'string') {
//     const weightKey = weight.toLowerCase();
//     return FONT_WEIGHT_MAP[weightKey] || FontWeight.Normal;
//   }

//   if (typeof weight === 'number') {
//     return FONT_WEIGHT_MAP[String(weight)] || FontWeight.Normal;
//   }

//   return FontWeight.Normal;
// };

// /**
//  * Typography component with responsive font sizing and proper font family selection
//  */
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
//   translate = true,
//   ...restProps
// }) => {
//   const { isLangRTL, t } = useTranslation();

//   // Flatten style prop (can be array, object, or number)
//   const flattenedStyle = useMemo(() => {
//     if (!style) return null;
//     if (Array.isArray(style)) {
//       return Object.assign({}, ...style.filter(Boolean));
//     }
//     if (typeof style === 'object') {
//       return style;
//     }
//     return null;
//   }, [style]);

//   // Get weight from style or prop
//   const styleWeight = flattenedStyle?.fontWeight;
//   const finalWeight = styleWeight ?? fontWeight;
//   const normalizedWeight = normalizeFontWeight(finalWeight);

//   // Get font family based on weight
//   const fontFamily = useMemo(() => {
//     return FONT_FAMILY_MAP[normalizedWeight] || FONT_FAMILY.POPPINS.REGULAR;
//   }, [normalizedWeight]);

//   // Get font size from style or prop, then make responsive based on device size and system scaling
//   const calculatedFontSize = useMemo(() => {
//     const sizeFromStyle = flattenedStyle?.fontSize;
//     const finalSize = sizeFromStyle ?? fontSize ?? DEFAULT_FONT_SIZE;

//     if (typeof finalSize === 'number') {
//       // Use responsive font size that adapts to device size and system font scaling
//       return Math.round(getResponsiveFontSize(finalSize));
//     }

//     return Math.round(getResponsiveFontSize(DEFAULT_FONT_SIZE));
//   }, [flattenedStyle, fontSize]);

//   // Get color - prioritize prop, then style, then default
//   const textColor = useMemo(() => {
//     return color || flattenedStyle?.color || COLORS.TEXT;
//   }, [color, flattenedStyle]);

//   // Calculate line height that scales with font size (if not provided)
//   const calculatedLineHeight = useMemo(() => {
//     if (lineHeight) return lineHeight;
//     // Default line height: 1.4x font size for better readability
//     return Math.round(calculatedFontSize * 1.4);
//   }, [lineHeight, calculatedFontSize]);

//   // Build base text style
//   const baseTextStyle: TextStyle = useMemo(
//     () => ({
//       ...(!isLangRTL && { fontFamily }),
//       fontSize: calculatedFontSize,
//       color: textColor,
//       fontWeight: 'normal', // Always normal when using custom fonts
//       fontStyle: italic ? 'italic' : 'normal',
//       textDecorationLine: underline ? 'underline' : 'none',
//       lineHeight: calculatedLineHeight,
//       writingDirection: isLangRTL ? 'rtl' : 'ltr',
//     }),
//     [isLangRTL, fontFamily, calculatedFontSize, textColor, italic, underline, calculatedLineHeight],
//   );

//   // Merge styles: base style first, then custom style (but exclude fontSize, fontWeight, and color to prevent conflicts)
//   const mergedStyle = useMemo(() => {
//     if (!flattenedStyle) return baseTextStyle;

//     // Extract conflicting properties and keep the rest
//     const { fontSize: _, fontWeight: __, color: ___, ...restStyle } = flattenedStyle;

//     // Return array so React Native can properly merge styles
//     return [baseTextStyle, restStyle];
//   }, [baseTextStyle, flattenedStyle]);

//   const displayText = translate ? t(children ?? '') : children;

//   return (
//     <Text
//       onPress={onPress}
//       style={mergedStyle}
//       allowFontScaling={false}
//       // allowFontScaling={true}
//       // maxFontSizeMultiplier={1.3}
//       {...restProps}
//     >
//       {displayText}
//     </Text>
//   );
// };
