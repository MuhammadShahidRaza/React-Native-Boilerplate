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
      title: 'Change Password',
      iconName: 'payments',
      onPress: () => navigate(SCREENS.CHANGE_PASSWORD),
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: 'Change Language',
      iconName: 'information',
      onPress: () => navigate(SCREENS.CHANGE_LANGUAGE),
      iconComponent: VARIABLES.MaterialCommunityIcons,
    },
    {
      title: 'Payment Information',
      iconName: 'contact-phone',
      onPress: () => navigate(SCREENS.PAYMENTINFORMATION),
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: 'Contact Support',
      iconName: 'settings-sharp',
      onPress: () => navigate(SCREENS.CONTACT_SUPPORT),
      iconComponent: VARIABLES.Ionicons,
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
                color: COLORS.ICONS,
                size: FontSize.Large,
                iconStyle,
              }}
                endIcon={{  // ✅ NEW: Right arrow icon
    componentName: VARIABLES.MaterialIcons,
    iconName: 'arrow-forward-ios',
    iconStyle:styles.iconStyle,
    size: FontSize.Small,
    color: COLORS.ICONS,
  }}
            />
          ),
        )}
        <Button title={COMMON_TEXT.LOGOUT} style={{alignSelf:'center',width:217}} />
        
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
    borderColor: COLORS.SECONDARY,
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
    color: COLORS.ICONS,
    fontSize: FontSize.Medium,
  },
  logoutText: {
    marginHorizontal: 60,
    color: COLORS.BORDER,
    fontSize: FontSize.MediumSmall,
  },
  iconStyle: {
  marginLeft: 40,
},
});
