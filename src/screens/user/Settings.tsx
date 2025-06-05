import {StyleSheet, View} from 'react-native';
import {
  Header,
  Icon,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/common';
import {
  COMMON_TEXT,
  HOME_TEXT,
  SETTINGS_TEXT,
  TEMPORARY_TEXT,
} from 'constants/screens';
import {VARIABLES} from 'constants/common';
import {COLORS} from 'utils/colors';
import {FLEX_CENTER, STYLES} from 'utils/commonStyles';
import {FontSize, FontWeight} from 'types/fontTypes';
import {navigate} from 'navigation/Navigators';
import {SCREENS} from 'constants/routes';
import {voidFuntionType} from 'types/common';
import {setIsUserLoggedIn} from 'store/slices/appSettings';
import {removeMultipleItem} from 'utils/storage';
import {useAppDispatch} from 'types/reduxTypes';

type Props = {
  iconName: string;
  title: string;
  onPress: voidFuntionType;
};

const ItemsView: React.FC<Props> = ({iconName, title, onPress}) => (
  <RowComponent onPress={onPress} style={styles.rowComponent}>
    <Icon
      componentName={VARIABLES.MaterialIcons}
      iconName={iconName}
      color={COLORS.SECONDARY}
      size={FontSize.ExtraLarge}
    />
    <Typography style={styles.typography}>{title}</Typography>
  </RowComponent>
);

export const Settings = () => {
  const dispatch = useAppDispatch();
  const handleDeactivateAccount = async () => {
    dispatch(setIsUserLoggedIn(false));
    await removeMultipleItem([
      VARIABLES.USER_TOKEN,
      VARIABLES.IS_USER_LOGGED_IN,
    ]);
  };

  return (
    <>
      <Wrapper>
        <Header title={COMMON_TEXT.SETTINGS} />
        <View style={STYLES.CONTAINER}>
          <ItemsView
            iconName="language"
            title={COMMON_TEXT.LANGUAGES}
            onPress={() => navigate(SCREENS.LANGUAGE)}
          />
        </View>
        <View style={STYLES.CONTAINER}>
          <ItemsView
            iconName="help"
            title={COMMON_TEXT.HELP_AND_SUPPORT}
            onPress={() => navigate(SCREENS.HELP)}
          />
        </View>
      </Wrapper>
      <View style={styles.footerContainer}>
        <Typography
          onPress={handleDeactivateAccount}
          style={styles.deactivateText}>
          {COMMON_TEXT.DEACTIVATE_ACCOUNT}
        </Typography>
        <Typography style={styles.infoText}>
          {SETTINGS_TEXT.TRANSFORMATIONAL_CUPPING}
        </Typography>
        <Typography style={styles.infoText}>
          {TEMPORARY_TEXT.VERSION}
        </Typography>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  rowComponent: {
    marginTop: 25,
    ...STYLES.GAP_25,
    justifyContent: 'flex-start',
  },
  typography: {
    fontSize: FontSize.MediumLarge,
  },
  footerContainer: {
    marginVertical: 20,
    ...FLEX_CENTER,
    ...STYLES.GAP_5,
  },
  deactivateText: {
    color: COLORS.ERROR,
    fontWeight: FontWeight.Black,
    fontSize: FontSize.Large,
  },
  infoText: {
    color: COLORS.GRAY,
    fontSize: FontSize.MediumSmall,
  },
});
