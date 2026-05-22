import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { AppGradient } from './AppGradient';
import { Icon, IconComponentProps } from './Icon';
import { BRAND_PRIMARY, BRAND_SECONDARY } from 'utils/index';

type GradientVariant = 'primary' | 'primaryLight';

interface GradientIconProps extends IconComponentProps {
  variant?: GradientVariant;
  gradientColors?: string[];
  containerSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export const GradientIcon = ({
  variant = 'primary',
  gradientColors = [BRAND_SECONDARY, BRAND_PRIMARY],
  containerSize = 44,
  containerStyle,
  borderRadius,
  onPress,
  ...iconProps
}: GradientIconProps) => {
  const gradient = (
    <AppGradient
      variant={variant}
      colors={gradientColors}
      style={[
        {
          width: containerSize,
          height: containerSize,
          borderRadius: borderRadius ?? 14,
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyle,
      ]}
      start={{ x: -1, y: 0 }}
      end={{ x: 1, y: 0.5 }}
    >
      <Icon {...iconProps} />
    </AppGradient>
  );

  if (!onPress) {
    return gradient;
  }

  const touchPad = Math.max(containerSize, 44);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        minWidth: touchPad,
        minHeight: touchPad,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {gradient}
    </Pressable>
  );
};
