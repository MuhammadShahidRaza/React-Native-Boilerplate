import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import {
  COLORS,
  deviceDetails,
  // getFCMToken,
  screenWidth,
  setItem,
  signUpValidationSchema,
} from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent, PhoneInputComponent } from 'components/index';
import { signUpUser } from 'api/functions/auth';
import { getCurrentLocation, reverseGeocode } from 'utils/location';
import { useAppDispatch } from 'types/reduxTypes';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setUserDetails } from 'store/slices/user';
import { navigate } from 'navigation/Navigators';

interface SignUpFormValues {
  email: string;
  full_name: string;
  username: string;
  phoneNumber: string;
  password: string;
  country: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export const SignUp = () => {
  const dispatch = useAppDispatch();
  const initialValues: SignUpFormValues = {
    email: __DEV__ ? 'shahid@mailinator.com' : '',
    password: __DEV__ ? 'Passward123!' : '',
    full_name: __DEV__ ? 'Shahid Raza' : '',
    username: __DEV__ ? 'shahid26' : '',
    country: __DEV__ ? 'Pakistan' : '',
    phoneNumber: __DEV__ ? '24244562' : '',
    confirmPassword: __DEV__ ? 'Passward123!' : '',
    showPassword: false,
    showConfirmPassword: false,
  };

  const handleSubmit = async (values: SignUpFormValues) => {
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      full_name: values?.full_name,
      username: values?.username,
      country: values?.country,
      phone: values?.phoneNumber,
      // device_token: await getFCMToken(),
      ...deviceDetails(),
    };
    navigate(SCREENS.VERIFICATION);
    // dispatch(setIsUserLoggedIn(true));
    // setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    // signUpUser({ data });
  };
  const formik = useFormikForm<SignUpFormValues>({
    initialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: handleSubmit,
  });

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

  return (
    <AuthComponent
      heading1={COMMON_TEXT.CREATE_AN_ACCOUNT}
      description={AUTH_TEXT.CONNECT_WITH_SIGNUP}
    >
      <FocusProvider>
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
          onChangeText={formik.handleChange('username')}
          onBlur={formik.handleBlur('username')}
          value={formik.values.username}
          placeholder={COMMON_TEXT.ENTER_USER_NAME}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'user',
          }}
          error={formik.errors.username}
          touched={Boolean(formik.touched.username && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
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
          onChangeText={formik.handleChange('phoneNumber')}
          value={formik.values.phoneNumber}
          allowSpacing={false}
          defaultCode={__DEV__ ? 'PK' : 'NG'}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
          }}
          placeholder={COMMON_TEXT.PHONE_NUMBER}
          error={formik.errors.phoneNumber}
          touched={Boolean(formik.touched.phoneNumber && formik.submitCount)}
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
            iconName: 'lock1',
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
            iconName: 'lock1',
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
      <Button title={COMMON_TEXT.REGISTER} onPress={formik.handleSubmit} style={styles.button} />
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
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
});
