import { Input } from 'components/common';
import { COMMON_TEXT } from 'constants/screens';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { StyleSheet } from 'react-native';
import { SetStateType, voidFuntionType } from 'types/common';

export const SearchBar = ({
  value = '',
  onChangeText = () => {},
  showBorder = true,
  onPress = () => navigate(SCREENS.SEARCH),
}: {
  value?: string;
  showBorder?: boolean;
  onPress?: voidFuntionType | null;
  onChangeText?: SetStateType<string>;
}) => {
  return (
    <Input
      value={value}
      placeholder={COMMON_TEXT.SEARCH}
      onChangeText={onChangeText}
      // endImage={
      //   <Photo
      //     size={15}
      //     source={IMAGES.FILTER_ICON}
      //     style={{padding: 12}}
      //     onPress={() => navigate(SCREENS.FILTER)}
      //   />
      // }
      secondContainerStyle={[styles.inputSecondContainer, { borderWidth: showBorder ? 1 : 0 }]}
      startIcon={{
        componentName: VARIABLES.Ionicons,
        iconName: 'search',
        color: COLORS.SECONDARY,
        size: FontSize.Large,
      }}
      containerStyle={styles.inputContainer}
      onPress={onPress ? onPress : undefined}
      name='search'
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    marginVertical: 30,
    paddingVertical: 3,
  },
  inputSecondContainer: {
    marginBottom: 0,
    borderColor: COLORS.BORDER,
  },
});
