import { IconComponentProps, Input } from 'components/index';
import { COLORS } from 'utils/colors';
import { COMMON_TEXT, VARIABLES } from 'constants/index';
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from 'react-native';
import { SetStateType, StyleType, voidFuntionType, FontSize } from 'types/index';

export const SearchBar = ({
  value = '',
  onChangeText = () => {},
  onSubmitEditing = () => {},
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
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
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
      returnKeyType='search'
      onSubmitEditing={onSubmitEditing}
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
