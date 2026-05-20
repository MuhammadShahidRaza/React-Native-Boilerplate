import { StyleProp, ViewStyle } from 'react-native';
import { AppGradient } from './AppGradient';
import { Icon, IconComponentProps } from './Icon';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';

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
  ...iconProps
}: GradientIconProps) => {
  return (
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
};
