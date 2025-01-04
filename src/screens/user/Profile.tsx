import {View, StyleSheet} from 'react-native';
import {
  Button,
  Header,
  Icon,
  Photo,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/common';
import {
  COMMON_TEXT,
  TEMPORARY_TEXT,
  VARIABLES,
  IMAGES,
  SCREENS,
} from 'constants/index';
import {FontSize, FontWeight} from 'types/fontTypes';
import {
  FLEX_CENTER,
  STYLES,
  COLORS,
  screenHeight,
  screenWidth,
  removeMultipleItem,
} from 'utils/index';
import {navigate} from 'navigation/Navigators';
import {setIsUserLoggedIn} from 'store/slices/appSettings';
import {useAppDispatch} from 'types/reduxTypes';

export const Profile = () => {
  const dispatch = useAppDispatch();
  const tabs = [
    {
      title: COMMON_TEXT.EDIT_PROFILE,
      iconName: 'pencil',
      onPress: () => navigate(SCREENS.EDIT_PROFILE),
      iconComponent: VARIABLES.MaterialCommunityIcons,
    },
    {
      title: COMMON_TEXT.PAYMENT_OPTIONS,
      iconName: 'payments',
      onPress: () => {},
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: COMMON_TEXT.CONTACT_US,
      iconName: 'contact-phone',
      onPress: () => navigate(SCREENS.CONTACT_US),
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: COMMON_TEXT.ABOUT_US,
      iconName: 'information',
      onPress: () => navigate(SCREENS.ABOUT),
      iconComponent: VARIABLES.MaterialCommunityIcons,
    },
    {
      title: COMMON_TEXT.SETTINGS,
      iconName: 'settings-sharp',
      onPress: () => navigate(SCREENS.SETTINGS),
      iconComponent: VARIABLES.Ionicons,
    },
    {
      title: COMMON_TEXT.LOGOUT,
      iconName: 'login',
      onPress: async () => {
        dispatch(setIsUserLoggedIn(false));
        await removeMultipleItem([
          VARIABLES.USER_TOKEN,
          VARIABLES.IS_USER_LOGGED_IN,
        ]);
      },
      iconComponent: VARIABLES.Entypo,
      iconStyle: {transform: [{scaleX: -1}]},
      marginTop: 70,
    },
  ];

  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.PROFILE} />
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.photoContainer}>
            <Photo
              source={IMAGES.USER}
              resizeMode="contain"
              imageStyle={styles.photo}
            />
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName={'pencil'}
              onPress={() => {}}
              color={COLORS.GRAY}
              iconStyle={styles.editIcon}
              size={FontSize.Large}
            />
          </View>
          <View style={styles.textContainer}>
            <Typography style={styles.nameText}>
              {TEMPORARY_TEXT.SHAHID}
            </Typography>
            <Typography>{TEMPORARY_TEXT.EMAIL}</Typography>
          </View>
        </View>

        {tabs.map(
          ({title, iconName, iconComponent, iconStyle, marginTop, onPress}) => (
            <Button
              key={title}
              onPress={onPress}
              containerStyle={[styles.buttonContainer, {marginTop}]}
              title={title}
              textStyle={styles.buttonText}
              style={styles.button}
              startIcon={{
                componentName: iconComponent,
                iconName,
                color: COLORS.MUD_TEXT,
                size: FontSize.Large,
                iconStyle,
              }}
            />
          ),
        )}
        <Typography style={styles.logoutText}>
          {COMMON_TEXT.SECURELY_LOGOUT}
        </Typography>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    marginBottom: 50,
  },
  profileHeader: {
    marginBottom: 30,
    ...FLEX_CENTER,
  },
  photoContainer: {
    marginVertical: 20,
    ...FLEX_CENTER,
  },
  photo: {
    width: screenWidth(25),
    height: screenHeight(12),
    borderWidth: 3,
    borderColor: COLORS.MUD_TEXT,
    borderRadius: screenWidth(20),
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderWidth: 0.1,
    padding: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  textContainer: {
    ...FLEX_CENTER,
  },
  nameText: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    gap: 20,
  },
  button: {
    backgroundColor: COLORS.TRANSPARENT,
  },
  buttonText: {
    color: COLORS.BLACK,
    fontSize: FontSize.MediumLarge,
  },
  logoutText: {
    marginHorizontal: 60,
    color: COLORS.BORDER,
    fontSize: FontSize.MediumSmall,
  },
});
