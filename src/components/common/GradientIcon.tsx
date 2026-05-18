import { StyleProp, ViewStyle } from 'react-native';
import { AppGradient } from './AppGradient';
import { Icon, IconComponentProps } from './Icon';
import { COLORS } from 'utils/index';

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
  gradientColors = [COLORS.APP_PRIMARY_DARK, COLORS.APP_PRIMARY_LIGHT],
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
      start={{ x: 0, y: 0 }} // Top-left
      end={{ x: 1, y: 1 }} // Bottom-right
    >
      <Icon {...iconProps} />
    </AppGradient>
  );
};
