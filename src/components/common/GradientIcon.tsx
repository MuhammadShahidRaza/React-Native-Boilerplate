import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { AppGradient } from './AppGradient';
import { Icon, IconComponentProps } from './Icon';
import { isSengoBrand } from 'constants/assets/brandLogo';
import { APP_GRADIENT_HORIZONTAL, GRADIENT_END, GRADIENT_START } from 'utils/index';

const IS_SENGO_GRADIENT = isSengoBrand();

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
  gradientColors = [...APP_GRADIENT_HORIZONTAL],
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
      start={IS_SENGO_GRADIENT ? GRADIENT_START : { x: -1, y: 0 }}
      end={IS_SENGO_GRADIENT ? GRADIENT_END : { x: 1, y: 0.5 }}
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
