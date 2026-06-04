import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  APP_GRADIENT_ICON,
  APP_GRADIENT_OFFER,
  APP_GRADIENT_PRIMARY,
  APP_GRADIENT_PRIMARY_LIGHT,
  GRADIENT_END,
  GRADIENT_START,
} from 'utils/index';
import type { LinearGradientProps } from 'react-native-linear-gradient';
import type { ReactNode } from 'react';

type GradientVariant = 'primary' | 'primaryLight' | 'icon' | 'offer';

export { GRADIENT_START, GRADIENT_END };

interface AppGradientProps extends Omit<LinearGradientProps, 'colors'> {
  variant?: GradientVariant;
  colors?: string[];
  children?: ReactNode;
  /** Stack gradient behind children (pill tabs, buttons). Required for reliable iOS layout. */
  fill?: boolean;
  hostStyle?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<GradientVariant, string[]> = {
  primary: [...APP_GRADIENT_PRIMARY],
  primaryLight: [...APP_GRADIENT_PRIMARY_LIGHT],
  icon: [...APP_GRADIENT_ICON],
  offer: [...APP_GRADIENT_OFFER],
};

export const AppGradient: React.FC<AppGradientProps> = ({
  variant = 'primary',
  colors,
  children,
  fill = false,
  hostStyle,
  style,
  start = GRADIENT_START,
  end = GRADIENT_END,
  ...rest
}) => {
  const resolved = colors ?? VARIANTS[variant];

  if (fill) {
    return (
      <View style={[styles.fillHost, hostStyle, style]}>
        <LinearGradient
          colors={resolved}
          start={start}
          end={end}
          pointerEvents='none'
          style={StyleSheet.absoluteFill}
          {...rest}
        />
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={resolved}
      start={start}
      end={end}
      style={[styles.gradient, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fillHost: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    overflow: 'hidden',
  },
});
