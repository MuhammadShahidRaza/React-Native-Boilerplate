import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  TextStyle,
  StyleProp,
} from 'react-native';
import { FontSize, StyleType } from 'types/index';
import { COLORS } from 'utils/index';
import { triggerHaptic } from 'utils/haptic';
import { Typography } from './Typography';
import { Icon, IconComponentProps } from './Icon';
import { RowComponent } from './Row';
import { AppGradient } from './AppGradient';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  onPress?: () => void;
  style?: StyleType;
  gradientStyle?: StyleType;
  containerStyle?: StyleType;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  loaderColor?: string;
  loaderSize?: 'small' | 'large';
  startIcon?: IconComponentProps;
  endIcon?: IconComponentProps;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  gradientStyle,
  textStyle,
  disabled,
  endIcon,
  loading = false,
  loadingText,
  startIcon,
  containerStyle,
  loaderColor = COLORS.WHITE,
  loaderSize = 'small',
  ...props
}) => {
  const isButtonLoading = loading;
  const isButtonDisabled = disabled || isButtonLoading;

  const textStyles = [styles.text, textStyle];

  return (
    <TouchableOpacity
      style={[styles.wrap, isButtonDisabled ? styles.disabledButton : null, style]}
      onPress={() => { triggerHaptic(); onPress?.(); }}
      disabled={isButtonDisabled}
      activeOpacity={0.85}
      {...props}
    >
      <AppGradient style={[styles.gradient, gradientStyle]}>
        {isButtonLoading ? (
          <RowComponent style={{ gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={loaderColor} size={loaderSize} />
            {loadingText ? <Typography style={textStyles}>{loadingText}</Typography> : null}
          </RowComponent>
        ) : (
          <RowComponent style={[{ gap: 10, justifyContent: 'center' }, containerStyle]}>
            {startIcon && <Icon {...startIcon} />}
            <Typography style={textStyles}>{title}</Typography>
            {endIcon && <Icon {...endIcon} />}
          </RowComponent>
        )}
      </AppGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 50,
    overflow: 'hidden',
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradient: {
    padding: 15,
  },
  text: {
    color: COLORS.WHITE,
    textAlign: 'center',
    textTransform: 'capitalize',
    fontSize: FontSize.MediumLarge,
  },
});
