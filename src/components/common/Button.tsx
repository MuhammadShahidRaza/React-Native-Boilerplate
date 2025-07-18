import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { FontSize, RootState, StyleType, useAppSelector } from 'types/index';
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
  startIcon,
  containerStyle,
  loaderColor = COLORS.WHITE,
  loaderSize = 'small',
  ...props
}) => {
  const isAppLoading = useAppSelector((state: RootState) => state.app.isAppLoading);
  const buttonStyles = [styles.button, disabled || loading ? styles.disabledButton : null, style];

  const textStyles = [
    styles.text,
    // disabled || loading ? styles.disabledText : null,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || (loading && isAppLoading)}
      {...props}
    >
      {loading || isAppLoading ? (
        <ActivityIndicator color={loaderColor} size={loaderSize} />
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
    borderRadius: 10,
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
