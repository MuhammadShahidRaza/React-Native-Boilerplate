import { Button, Input, ProfilePictureUpload, Wrapper } from 'components/common';
import { SCREENS } from 'constants/index';
import { COMMON_TEXT } from 'constants/screens';
import { FocusProvider } from 'hooks/useFocus';
import { navigate } from 'navigation/Navigators';
import { StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { useAppSelector } from 'types/reduxTypes';
import { EditProfileFormTypes } from 'types/screenTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { safeString, screenWidth } from 'utils/helpers';

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
    <Wrapper useScrollView={true} headerTitle='My Profile'>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <ProfilePictureUpload
            source={userDetails?.profile_image}
            showEditIcon={false}
            disabled={true}
            size={screenWidth(30)}
            containerStyle={styles.photoContainer}
          />
          <Input
            name={COMMON_TEXT.FULL_NAME}
            title={COMMON_TEXT.FULL_NAME}
            onChangeText={() => {}}
            value={safeString(userDetails?.full_name)}
            editable={false}
            secondContainerStyle={{
              borderWidth: 0,
              borderBottomWidth: 1,
              marginBottom: 20,
            }}
            isTitleInLine={true}
            placeholder={COMMON_TEXT.ENTER_FULL_NAME}
            // startIcon={{
            //   componentName: VARIABLES.Feather,
            //   iconName: 'user',
            // }}
          />
          {/* <Input
            name={COMMON_TEXT.USERNAME}
            title={COMMON_TEXT.USERNAME}
            onChangeText={() => {}}
            value={safeString(userDetails?.user_name)}
            editable={false}
            placeholder={COMMON_TEXT.ENTER_USER_NAME}
            // startIcon={{
            //   componentName: VARIABLES.Feather,
            //   iconName: 'user',
            // }}
          /> */}
          <Input
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL_ADDRESS}
            onChangeText={() => {}}
            value={safeString(userDetails?.email)}
            allowSpacing={false}
            editable={false}
            isTitleInLine={true}
            secondContainerStyle={{
              borderWidth: 0,
              borderBottomWidth: 1,
              marginBottom: 20,
            }}
            // startIcon={{
            //   componentName: VARIABLES.MaterialCommunityIcons,
            //   iconName: 'email-outline',
            // }}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          />

          {/* <Autocomplete
            title='Address'
            placeholder='Enter your address'
            value={getUserAddressString(userDetails?.address)}
            showCurrentLocationButton={false}
            disabled={true}
            isTitleInLine={true}
            containerStyle={{
              borderWidth: 0,
              borderBottomWidth: 1, marginBottom: 20,
            }}
            setReverseGeocodedAddress={() => { }}
          />

          <Input
            name='zip_code'
            title='Zip Code'
            value={safeString(userDetails?.zip_code)}
            onChangeText={() => { }}
            keyboardType='numeric'
            editable={false}
            isTitleInLine={true}
            placeholder='Enter zip code'
            maxLength={8}
            secondContainerStyle={{
              borderWidth: 0,
              borderBottomWidth: 1, marginBottom: 20,
            }}
          /> */}

          {/* <Input
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
          /> */}
        </FocusProvider>
        <Button title={COMMON_TEXT.EDIT_PROFILE} onPress={handleSubmit} style={styles.button} />
        {/* <Typography
          onPress={() => {
            navigate(SCREENS.CHANGE_PASSWORD);
          }}
          style={styles.changePasswordText}
        >
          {COMMON_TEXT.CHANGE_PASSWORD}
        </Typography> */}
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
  },
  button: {
    marginVertical: 50,
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
