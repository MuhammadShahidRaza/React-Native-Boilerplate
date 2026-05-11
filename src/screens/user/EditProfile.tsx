import { StyleSheet, View } from 'react-native';
import { Button, Input, Wrapper, ProfilePictureUpload } from 'components/index';
import { COMMON_TEXT } from 'constants/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { EditProfileFormTypes, FontSize, FontWeight, useAppSelector } from 'types/index';
import {
  screenWidth,
  COLORS,
  STYLES,
  safeString,
  editProfileValidationSchemaWithProfileImage,
  hasUri,
} from 'utils/index';
import { updateUserDetails } from 'api/functions/app/user';
import { isWorkerRole } from 'config/app';
import { SelectedMedia } from 'hooks/useMediaPicker';

export const EditProfile = () => {
  const { userDetails } = useAppSelector(state => state?.user);
  const role = useAppSelector(state => state?.user?.role);
  const isDentor = isWorkerRole(role);
  // console.log({ userDetails });

  const initialValues = {
    full_name: safeString(userDetails?.full_name),
    email: safeString(userDetails?.email),
    profile_image: userDetails?.profile_image || '',
    // address: safeString(userDetails?.address),
    // latitude: userDetails?.latitude || 0,
    // longitude: userDetails?.longitude || 0,
    // city: safeString(userDetails?.city),
    // state: safeString(userDetails?.state),
    // country: safeString(userDetails?.country),
    // zip_code: safeString(userDetails?.zip_code),
  };

  const handleSubmit = async (values: EditProfileFormTypes) => {
    const { profile_image, ...rest } = values;
    await updateUserDetails({
      ...rest,
      ...(hasUri(profile_image) ? { profile_image } : {}),
    });
  };

  // Create conditional validation schema - profile_image required only for dentors

  const formik = useFormikForm({
    initialValues,
    enableReinitialize: true,
    validationSchema: editProfileValidationSchemaWithProfileImage({ isDentor }),
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  // Handle profile image selection
  const handleProfileImageSelected = (image: SelectedMedia) => {
    formik.setFieldValue('profile_image', image ?? '');
    formik.setFieldTouched('profile_image', true);
  };

  return (
    <Wrapper useScrollView={true} headerTitle={COMMON_TEXT.EDIT_PROFILE}>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <ProfilePictureUpload
            source={userDetails?.profile_image ?? ''}
            onImageSelected={handleProfileImageSelected}
            showEditIcon={true}
            disabled={false}
            size={screenWidth(30)}
            error={isDentor ? formik.errors.profile_image : undefined}
            touched={
              isDentor ? Boolean(formik.touched.profile_image && formik.submitCount > 0) : false
            }
            containerStyle={styles.profileHeader}
          />
          <Input
            name={COMMON_TEXT.FULL_NAME}
            title={COMMON_TEXT.FULL_NAME}
            onChangeText={formik.handleChange('full_name')}
            onBlur={formik.handleBlur('full_name')}
            value={formik.values.full_name}
            placeholder={COMMON_TEXT.ENTER_FULL_NAME}
            error={formik.errors.full_name}
            touched={Boolean(formik.touched.full_name && formik.submitCount)}
          />

          <Input
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL_ADDRESS}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            value={formik.values.email}
            allowSpacing={false}
            editable={false}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
            error={formik.errors.email}
            touched={Boolean(formik.touched.email && formik.submitCount)}
          />

          {/* <Autocomplete
            title='Address*'
            placeholder='Enter your address'
            setReverseGeocodedAddress={(address) => {
              if (address?.fullAddress) {
                formik.setFieldValue('address', address.fullAddress);
                formik.setFieldTouched('address', true);
              }
            }}
            error={formik.errors.address}
            touched={Boolean(formik.touched.address && formik.submitCount)}
          /> */}

          {/* <Autocomplete
            title='Address'
            placeholder='Enter your address'
            setReverseGeocodedAddress={(address) => {
              formik.setFieldValue('address', address?.fullAddress || '')
              formik.setFieldValue('zip_code', address?.postalCode || '')
              formik.setFieldValue('latitude', address?.latitude || '')
              formik.setFieldValue('city', address?.city || '')
              formik.setFieldValue('country', address?.country || '')
              formik.setFieldValue('state', address?.country || '') //TODO: change to state
              formik.setFieldValue('longitude', address?.longitude || '')
            }}
            value={formik.values.address}
            error={formik.errors.address}
            touched={Boolean(formik.touched.address && formik.submitCount)}
          />

          <Input
            name='zip_code'
            title='Zip Code'
            value={formik.values.zip_code}
            onChangeText={formik.handleChange('zip_code')}
            keyboardType='numeric'
            placeholder='Enter zip code'
            error={formik.errors.zip_code}
            touched={Boolean(formik.touched.zip_code && formik.submitCount)}
            maxLength={8}
          /> */}
        </FocusProvider>
        <Button
          loading={loading}
          title={COMMON_TEXT.UPDATE}
          onPress={onPress}
          disabled={!formik.dirty}
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
    marginTop: 20,
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
