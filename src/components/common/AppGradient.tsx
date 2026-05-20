import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { APP_GRADIENT_PRIMARY, APP_GRADIENT_PRIMARY_LIGHT, COLORS } from 'utils/index';
import type { LinearGradientProps } from 'react-native-linear-gradient';
import type { ReactNode } from 'react';

type GradientVariant = 'primary' | 'primaryLight' | 'icon';

/** iOS requires 0–1 vectors; negative values break rendering. */
export const GRADIENT_START = { x: 0, y: 0.5 } as const;
export const GRADIENT_END = { x: 1, y: 0.5 } as const;

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
  icon: [COLORS.APP_PRIMARY_DARK, COLORS.APP_PRIMARY_LIGHT],
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
