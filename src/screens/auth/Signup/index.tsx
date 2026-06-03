import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import {
  COLORS,
  deviceDetails,
  buildPhonePayload,
  screenWidth,
  signUpValidationSchemaWithProfileImage,
} from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import {
  Button,
  Input,
  AuthComponent,
  PhoneInputComponent,
  Checkbox,
  RowComponent,
  Typography,
  ProfilePictureUpload,
} from 'components/index';
// import { getCurrentLocation, reverseGeocode } from 'utils/location';
import { signUpUser } from 'api/functions/auth';
import { isWorkerRole } from 'config/app';
import { navigate } from 'navigation/index';
import { Login_SignUp, type USER_TYPE } from 'types/auth';
import { RootState } from 'types/reduxTypes';
import { useSelector } from 'react-redux';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { logger } from 'utils/logger';

interface SignUpFormValues {
  email: string;
  full_name: string;
  user_name?: string;
  phone_number?: string;
  password: string;
  country?: string;
  confirmPassword: string;
  country_code?: string;
  calling_code?: string;
  user_type: USER_TYPE;
  profile_image?: SelectedMedia | null;
  showPassword: boolean;
  agreeToTerms: boolean;
  showConfirmPassword: boolean;
}

export const SignUp = () => {
  const role = useSelector((state: RootState) => state.user.role);

  const initialValues: SignUpFormValues = {
    // Use a fresh email/phone in dev — user@mailinator.com is already registered on staging.
    email: __DEV__ ? 'newuser@mailinator.com' : '',
    password: __DEV__ ? 'Passward123!' : '',
    full_name: __DEV__ ? 'John Doe' : '',
    user_type: role,
    profile_image: null,
    // user_name: __DEV__ ? 'shahid26' : '',
    // country: __DEV__ ? 'Pakistan' : '',
    phone_number: __DEV__ ? '30012345678' : '',
    country_code: __DEV__ ? 'PK' : 'US',
    calling_code: __DEV__ ? '+92' : '+234',
    confirmPassword: __DEV__ ? 'Passward123!' : '',
    showPassword: false,
    agreeToTerms: false,
    showConfirmPassword: false,
  };

  const handleSubmit = async (values: SignUpFormValues) => {
    const deviceInfo = await deviceDetails();
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      full_name: values?.full_name,
      user_type: role,
      ...(values?.profile_image && {
        profile_image: values?.profile_image,
      }),
      // user_name: values?.user_name,
      // country: values?.country,
      ...buildPhonePayload(values),
      ...deviceInfo,
    };

    logger.log('data', data);
    await signUpUser({ data });
  };

  const formik = useFormikForm<SignUpFormValues>({
    initialValues,
    validationSchema: signUpValidationSchemaWithProfileImage({ role }),
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  // Handle profile image selection
  const handleProfileImageSelected = (image: SelectedMedia) => {
    formik.setFieldValue('profile_image', image ?? null);
    formik.setFieldTouched('profile_image', true);
  };

  return (
    <AuthComponent
      heading1={AUTH_TEXT.SIGN_UP_HEADING}
      description={AUTH_TEXT.SIGN_UP_DESCRIPTION}
      bottomButtonText={COMMON_TEXT.LOGIN}
    >
      <FocusProvider>
        {isWorkerRole(role) && (
          <ProfilePictureUpload
            source={formik.values.profile_image?.uri || null}
            onImageSelected={handleProfileImageSelected}
            showEditIcon={true}
            disabled={false}
            size={screenWidth(30)}
            error={formik.errors.profile_image}
            touched={Boolean(formik.touched.profile_image && formik.submitCount > 0)}
            containerStyle={styles.profileHeader}
          />
        )}

        <Input
          name={COMMON_TEXT.FULL_NAME}
          title={COMMON_TEXT.NAME}
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
        {/* <Input
          name={COMMON_TEXT.USERNAME}
          title={COMMON_TEXT.USERNAME}
          onChangeText={formik.handleChange('user_name')}
          onBlur={formik.handleBlur('user_name')}
          value={formik.values.user_name}
          placeholder={COMMON_TEXT.ENTER_USER_NAME}
          // startIcon={{
          //   componentName: VARIABLES.Feather,
          //   iconName: 'user',
          // }}
          error={formik.errors.user_name}
          touched={Boolean(formik.touched.user_name && formik.submitCount)}
        /> */}
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          autoCapitalize='none'
          autoCorrect={false}
          startIcon={{
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'email-outline',
          }}
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />
        {/* <Input
          name={COMMON_TEXT.COUNTRY}
          title={COMMON_TEXT.COUNTRY}
          onChangeText={formik.handleChange('country')}
          onBlur={formik.handleBlur('country')}
          value={formik.values.country}
          placeholder={COMMON_TEXT.ENTER_COUNTRY}
          // startIcon={{
          //   componentName: VARIABLES.MaterialIcons,
          //   iconName: 'language',
          // }}
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
        /> */}
        <PhoneInputComponent
          name={COMMON_TEXT.PHONE_NUMBER}
          title={COMMON_TEXT.PHONE_NUMBER}
          editable
          onChangeText={formik.handleChange('phone_number')}
          value={formik.values.phone_number ?? ''}
          onChangeCountryCode={formik.handleChange('country_code')}
          onChangeCallingCode={formik.handleChange('calling_code')}
          defaultCode={(formik.values.country_code || 'US') as 'US'}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
          }}
          placeholder={COMMON_TEXT.PHONE_NUMBER}
          error={formik.errors.phone_number}
          touched={Boolean(formik.touched.phone_number && formik.submitCount)}
        />

        <Input
          name={COMMON_TEXT.PASSWORD}
          title={COMMON_TEXT.PASSWORD}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          value={formik.values.password}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock',
          }}
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () => formik.setFieldValue('showPassword', !formik.values.showPassword),
          }}
          secureTextEntry={!formik.values.showPassword}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.CONFIRM_PASSWORD}
          title={COMMON_TEXT.CONFIRM_PASSWORD}
          onChangeText={formik.handleChange('confirmPassword')}
          onBlur={formik.handleBlur('confirmPassword')}
          value={formik.values.confirmPassword}
          allowSpacing={false}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock',
          }}
          placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
          returnKeyType='done'
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showConfirmPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword),
          }}
          secureTextEntry={!formik.values.showConfirmPassword}
          error={formik.errors.confirmPassword}
          touched={Boolean(formik.touched.confirmPassword && formik.submitCount)}
        />
      </FocusProvider>

      <Checkbox
        checked={formik.values.agreeToTerms}
        onChange={value => formik.setFieldValue('agreeToTerms', value)}
        extraLabel={
          <RowComponent style={{ flexWrap: 'wrap', justifyContent: 'flex-start', gap: 3 }}>
            <Typography style={styles.agreeTerms}>{COMMON_TEXT.I_AGREE_TO_THE}</Typography>
            <Typography
              onPress={() => {
                navigate(SCREENS.PRIVACY_POLICY, {
                  title: COMMON_TEXT.TERMS_AND_CONDITIONS,
                });
              }}
              style={{ color: COLORS.PRIMARY, ...styles.agreeTerms }}
            >
              {COMMON_TEXT.TERMS_AND_CONDITIONS}
            </Typography>
            <Typography style={styles.agreeTerms}>{COMMON_TEXT.AND}</Typography>
            <Typography
              onPress={() => {
                navigate(SCREENS.PRIVACY_POLICY, {
                  title: COMMON_TEXT.PRIVACY_POLICY,
                });
              }}
              style={{ color: COLORS.PRIMARY, ...styles.agreeTerms }}
            >
              {COMMON_TEXT.PRIVACY_POLICY}
            </Typography>
          </RowComponent>
        }
      />

      <Button
        loading={loading}
        title={COMMON_TEXT.SIGN_UP}
        disabled={!formik.values.agreeToTerms}
        onPress={onPress}
        style={styles.button}
      />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  checkbox: {},
  forgotPassword: {
    color: COLORS.ERROR,
  },
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
  agreeTerms: {
    fontSize: FontSize.Small,
  },

  profileHeader: {
    marginBottom: 10,
  },
});
