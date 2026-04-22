import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { FontSize, StyleType } from 'types/index';
import { COLORS } from 'utils/index';
import { Typography } from './Typography';
import { Icon, IconComponentProps } from './Icon';
import { RowComponent } from './Row';
import { StyleProp } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress?: () => void;
  style?: StyleType;
  containerStyle?: StyleType;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  /** When loading, show this text instead of/in addition to spinner (e.g. "Uploading 45%") */
  loadingText?: string;
  loaderColor?: string;
  loaderSize?: 'small' | 'large';
  startIcon?: IconComponentProps;
  endIcon?: IconComponentProps;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
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

  const buttonStyles = [styles.button, isButtonDisabled ? styles.disabledButton : null, style];

  const textStyles = [styles.text, textStyle];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={isButtonDisabled} {...props}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 50,
    opacity: 1,
  },
  disabledButton: {
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.5,
  },
  text: {
    color: COLORS.WHITE,
    textAlign: 'center',
    textTransform: 'capitalize',
    fontSize: FontSize.MediumLarge,
  },
  disabledText: {
    color: COLORS.DARK_GREY,
  },
});
