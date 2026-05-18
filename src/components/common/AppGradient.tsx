import LinearGradient from 'react-native-linear-gradient';
import { APP_GRADIENT_PRIMARY, APP_GRADIENT_PRIMARY_LIGHT, COLORS } from 'utils/index';
import type { LinearGradientProps } from 'react-native-linear-gradient';
import type { ReactNode } from 'react';

type GradientVariant = 'primary' | 'primaryLight' | 'icon';

interface AppGradientProps extends Omit<LinearGradientProps, 'colors'> {
  variant?: GradientVariant;
  colors?: string[];
  children?: ReactNode;
}

const VARIANTS: Record<GradientVariant, readonly string[]> = {
  primary: APP_GRADIENT_PRIMARY,
  primaryLight: APP_GRADIENT_PRIMARY_LIGHT,
  icon: [COLORS.APP_PRIMARY_DARK, COLORS.APP_PRIMARY_LIGHT],
};

export const AppGradient: React.FC<AppGradientProps> = ({
  variant = 'primary',
  colors,
  children,
  ...rest
}) => {
  const resolved = colors ?? [...VARIANTS[variant]];
  return (
    <LinearGradient colors={resolved} {...rest}>
      {children}
    </LinearGradient>
  );
};
