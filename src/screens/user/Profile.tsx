import { Button, Input, PhoneInputComponent, Photo, Typography, Wrapper } from 'components/common';
import { IMAGES, SCREENS, VARIABLES } from 'constants/index';
import { COMMON_TEXT } from 'constants/screens';
import { FocusProvider } from 'hooks/useFocus';
import { navigate } from 'navigation/Navigators';
import { StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { useAppSelector } from 'types/reduxTypes';
import { EditProfileFormTypes } from 'types/screenTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { safeString, screenHeight, screenWidth, splitPhoneNumberWithCode } from 'utils/helpers';

export type EditProfileFormExtended = EditProfileFormTypes & {
  country_code?: string;
  calling_code?: string;
};

export const Profile = () => {
  const { userDetails } = useAppSelector(state => state?.user);

  const handleSubmit = async () => {
    navigate(SCREENS.EDIT_PROFILE);
  };

  return (
    <Wrapper useScrollView={true} useSafeArea={false}>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <View style={styles.photoContainer}>
            <Photo
              source={userDetails?.profile_image ?? IMAGES.USER_IMAGE}
              resizeMode='contain'
              imageStyle={styles.photo}
            />
          </View>
          <Input
            name={COMMON_TEXT.FULL_NAME}
            title={COMMON_TEXT.FULL_NAME}
            onChangeText={() => {}}
            value={safeString(userDetails?.full_name)}
            editable={false}
            placeholder={COMMON_TEXT.ENTER_FULL_NAME}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
            }}
          />
          <Input
            name={COMMON_TEXT.USERNAME}
            title={COMMON_TEXT.USERNAME}
            onChangeText={() => {}}
            value={safeString(userDetails?.user_name)}
            editable={false}
            placeholder={COMMON_TEXT.ENTER_USER_NAME}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
            }}
          />
          <Input
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL}
            onChangeText={() => {}}
            value={safeString(userDetails?.email)}
            allowSpacing={false}
            editable={false}
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'email-outline',
            }}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          />
          <Input
            name={COMMON_TEXT.COUNTRY}
            title={COMMON_TEXT.COUNTRY}
            onChangeText={() => {}}
            value={safeString(userDetails?.country)}
            editable={false}
            placeholder={COMMON_TEXT.ENTER_COUNTRY}
            startIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'language',
            }}
            endIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'my-location',
              size: FontSize.Large,
            }}
          />
          <PhoneInputComponent
            key={userDetails?.phone_number}
            name={COMMON_TEXT.PHONE_NUMBER}
            title={COMMON_TEXT.PHONE_NUMBER}
            editable={false}
            onChangeText={() => {}}
            value={safeString(splitPhoneNumberWithCode(userDetails?.phone_number)?.number)}
            allowSpacing={false}
            onChangeCountryCode={() => {}}
            onChangeCallingCode={() => {}}
            defaultCode={safeString(userDetails?.country_code) as any}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'phone',
            }}
            placeholder={COMMON_TEXT.PHONE_NUMBER}
          />
        </FocusProvider>
        <Button title={COMMON_TEXT.EDIT_PROFILE} onPress={handleSubmit} style={styles.button} />
        <Typography
          onPress={() => {
            navigate(SCREENS.CHANGE_PASSWORD);
          }}
          style={styles.changePasswordText}
        >
          {COMMON_TEXT.CHANGE_PASSWORD}
        </Typography>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileHeader: {
    marginBottom: 10,
    ...FLEX_CENTER,
  },
  photoContainer: {
    marginVertical: 20,
    ...FLEX_CENTER,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    padding: 7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: {
    width: screenWidth(30),
    height: screenHeight(14),
    borderWidth: 1,
    padding: 5,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.PRIMARY,
    borderRadius: screenWidth(35),
  },
  button: {
    marginVertical: 20,
  },
  changePasswordText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumLarge,
    textAlign: 'center',
    marginBottom: 20,
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: { marginBottom: 10 },
});
