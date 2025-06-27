import { IconComponentProps, Input } from 'components/index';
import { COLORS } from 'utils/colors';
import { COMMON_TEXT, VARIABLES } from 'constants/index';
import { StyleSheet } from 'react-native';
import { SetStateType, StyleType, voidFuntionType, FontSize } from 'types/index';

export const SearchBar = ({
  value = '',
  onChangeText = () => {},
  showBorder = true,
  onPress = () => {},
  containerStyle,
  endIcon,
  secondContainerStyle,
}: {
  value?: string;
  showBorder?: boolean;
  onPress?: voidFuntionType | null;
  onChangeText?: SetStateType<string>;
  containerStyle?: StyleType;
  endIcon?: IconComponentProps;
  secondContainerStyle?: StyleType;
}) => {
  return (
    <Input
      value={value}
      placeholder={COMMON_TEXT.SEARCH}
      onChangeText={onChangeText}
      secondContainerStyle={[
        styles.inputSecondContainer,
        { borderWidth: showBorder ? 1 : 0 },
        secondContainerStyle,
      ]}
      startIcon={{
        componentName: VARIABLES.Ionicons,
        iconName: 'search',
        color: COLORS.SECONDARY,
        size: FontSize.Large,
      }}
      {...(endIcon && { endIcon: endIcon })}
      containerStyle={[styles.inputContainer, containerStyle]}
      onPress={onPress ? onPress : undefined}
      name='search'
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    paddingVertical: 3,
  },
  inputSecondContainer: {
    marginBottom: 0,
    borderRadius: 10,
    borderColor: COLORS.BORDER,
  },
});
