import { Input } from 'components/common';
import { COMMON_TEXT } from 'constants/screens';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { VARIABLES } from 'constants/common';
import { StyleSheet } from 'react-native';
import { SetStateType, StyleType, voidFuntionType } from 'types/common';

export const SearchBar = ({
  value = '',
  onChangeText = () => {},
  showBorder = true,
  onPress = () => {},
  containerStyle,
  secondContainerStyle,
}: {
  value?: string;
  showBorder?: boolean;
  onPress?: voidFuntionType | null;
  onChangeText?: SetStateType<string>;
  containerStyle?: StyleType;
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
