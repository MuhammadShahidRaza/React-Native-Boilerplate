import { StyleSheet, View } from 'react-native';
import { Button, Icon, Input, PhoneInputComponent, Photo, Wrapper } from 'components/index';
import { IMAGES, VARIABLES } from 'constants/index';
import { COMMON_TEXT } from 'constants/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize, FontWeight, useAppSelector } from 'types/index';
import {
  editProfileValidationSchema,
  getCurrentLocation,
  reverseGeocode,
  screenHeight,
  screenWidth,
  COLORS,
  FLEX_CENTER,
  STYLES,
  safeString,
  splitPhoneNumberWithCode,
  openCameraOrGallery,
  normalizePhoneNumber,
} from 'utils/index';
import { updateUserDetails } from 'api/functions/app/user';
import { EditProfileFormExtended } from './Profile';
import { useMediaPicker, UseMediaPickerOptions } from 'hooks/useMediaPicker';

export const EditProfile = () => {
  const { pickMedia, selectedMedia } = useMediaPicker();
  const { userDetails } = useAppSelector(state => state?.user);
  const initialValues: EditProfileFormExtended = {
    email: safeString(userDetails?.email),
    full_name: safeString(userDetails?.full_name),
    user_name: safeString(userDetails?.user_name),
    country: safeString(userDetails?.country),
    phone_number: safeString(splitPhoneNumberWithCode(userDetails?.phone_number)?.number),
    country_code: safeString(userDetails?.country_code),
    calling_code:
      safeString(splitPhoneNumberWithCode(userDetails?.phone_number)?.countryCode) ??
      safeString(userDetails?.calling_code),
  };

  const getCountry = async () => {
    const position = await getCurrentLocation();
    if (position?.coords) {
      const getAddress = await reverseGeocode({
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
      });
      formik.setFieldValue('country', getAddress?.country);
    }
  };

  const handleSubmit = async (values: EditProfileFormExtended) => {
    const phone_number = normalizePhoneNumber(values?.phone_number, values?.calling_code);

    updateUserDetails({
      ...values,
      phone_number,
      ...(selectedMedia?.[0]?.uri && {
        profile_image: selectedMedia?.[0],
      }),
    });
  };

  const formik = useFormikForm<EditProfileFormExtended>({
    initialValues,
    enableReinitialize: true,
    validationSchema: editProfileValidationSchema,
    onSubmit: handleSubmit,
  });
  const imageConfig: UseMediaPickerOptions = {
    mediaType: 'image',
    cropping: true,
    width: 300,
    height: 300,
    cropperCircleOverlay: true,
  };
  return (
    <Wrapper useScrollView={true} useSafeArea={false}>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <View style={styles.profileHeader}>
            <View style={styles.photoContainer}>
              <Photo
                source={selectedMedia?.[0]?.uri ?? userDetails?.profile_image ?? IMAGES.USER_IMAGE}
                resizeMode='contain'
                imageStyle={styles.photo}
              />
              <Icon
                componentName={VARIABLES.Entypo}
                iconName={'camera'}
                onPress={() => {
                  openCameraOrGallery({
                    cameraPress: () => {
                      pickMedia({ ...imageConfig, source: 'camera' });
                    },
                    galleryPress: () => {
                      pickMedia({
                        ...imageConfig,
                        source: 'gallery',
                      });
                    },
                  });
                }}
                color={COLORS.PRIMARY}
                iconStyle={styles.editIcon}
              />
            </View>
          </View>
          <Input
            name={COMMON_TEXT.FULL_NAME}
            title={COMMON_TEXT.FULL_NAME}
            onChangeText={formik.handleChange('full_name')}
            onBlur={formik.handleBlur('full_name')}
            value={formik.values.full_name}
            placeholder={COMMON_TEXT.ENTER_FULL_NAME}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
            }}
            error={formik.errors.full_name}
            touched={Boolean(formik.touched.full_name && formik.submitCount)}
          />
          <Input
            name={COMMON_TEXT.USERNAME}
            title={COMMON_TEXT.USERNAME}
            onChangeText={formik.handleChange('user_name')}
            onBlur={formik.handleBlur('user_name')}
            value={formik.values.user_name}
            placeholder={COMMON_TEXT.ENTER_USER_NAME}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
            }}
            error={formik.errors.user_name}
            touched={Boolean(formik.touched.user_name && formik.submitCount)}
          />
          <Input
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            value={formik.values.email}
            allowSpacing={false}
            editable={false}
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'email-outline',
            }}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
            error={formik.errors.email}
            touched={Boolean(formik.touched.email && formik.submitCount)}
          />
          <Input
            name={COMMON_TEXT.COUNTRY}
            title={COMMON_TEXT.COUNTRY}
            onChangeText={formik.handleChange('country')}
            onBlur={formik.handleBlur('country')}
            value={formik.values.country}
            placeholder={COMMON_TEXT.ENTER_COUNTRY}
            startIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'language',
            }}
            endIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'my-location',
              size: FontSize.Large,
              onPress: () => {
                getCountry();
              },
            }}
            error={formik.errors.country}
            touched={Boolean(formik.touched.country && formik.submitCount)}
          />
          <PhoneInputComponent
            name={COMMON_TEXT.PHONE_NUMBER}
            title={COMMON_TEXT.PHONE_NUMBER}
            onChangeText={formik.handleChange('phone_number')}
            value={formik.values.phone_number}
            allowSpacing={false}
            defaultCode={formik.values.country_code as any}
            onChangeCountryCode={formik.handleChange('country_code')}
            onChangeCallingCode={formik.handleChange('calling_code')}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'phone',
            }}
            placeholder={COMMON_TEXT.PHONE_NUMBER}
            error={formik.errors.phone_number}
            touched={Boolean(formik.touched.phone_number && formik.submitCount)}
          />
        </FocusProvider>
        <Button
          loading={true}
          title={COMMON_TEXT.UPDATE}
          onPress={formik.handleSubmit}
          style={styles.button}
        />
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
    padding: 5,
    borderRadius: 14,
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
