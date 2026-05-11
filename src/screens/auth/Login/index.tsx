import { StyleSheet, View } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, VARIABLES, SCREENS, SVG } from 'constants/index';
import {
  loginValidationSchema,
  COLORS,
  screenWidth,
  deviceDetails,
  getUserDetailsByRole,
} from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import {
  Button,
  Typography,
  Input,
  AuthComponent,
  RowComponent,
  Checkbox,
  SocialButton,
  PhoneInputComponent,
} from 'components/index';
import { navigate } from 'navigation/index';
import { loginUser, loginUserThroughSocial } from 'api/functions/auth';
import { Login_SignUp, type USER_TYPE } from 'types/auth';
import { RootState } from 'types/reduxTypes';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { GoogleSignIn, AppleSignIn } from 'utils/helpers/socialLogins';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  user_type: USER_TYPE;
  phone_number: string;
  country_code: string;
  calling_code: string;
}

export const Login = () => {
  const role = useSelector((state: RootState) => state.user.role);
  const initialValues: LoginFormValues = {
    // email: __DEV__ ? 'shahid@mailinator.com' : '',
    // password: __DEV__ ? 'Passward123!' : '',
    email: '',
    password: '',
    phone_number: '',
    country_code: '',
    calling_code: '',
    showPassword: false,
    rememberMe: false,
    user_type: role,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    const deviceInfo = await deviceDetails();
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      user_type: values?.user_type,
      phone_number: values?.phone_number,
      country_code: values?.country_code,
      calling_code: values?.calling_code,
      ...deviceInfo,
    };

    // ✅ Make sure to await the async operation
    await loginUser({ data, rememberMe: values?.rememberMe });
  };

  const formik = useFormikForm<LoginFormValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  });

  // Load remember-me data (getUserDetailsByRole prompts biometric when saved data exists)
  useEffect(() => {
    getUserDetailsByRole(role).then(saved => {
      if (!saved?.email && !saved?.user_type) return;
      formik.setValues(prev => ({
        ...prev,
        email: saved.email ?? '',
        password: saved.password ?? '',
        user_type: saved.user_type as USER_TYPE,
      }));
    });
  }, []);

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  return (
    <AuthComponent
      heading1={AUTH_TEXT.LOGIN_HEADING}
      description={AUTH_TEXT.LOGIN_DESCRIPTION}
      bottomText={COMMON_TEXT.DONT_HAVE_AN_ACCOUNT}
      bottomButtonText={COMMON_TEXT.SIGN_UP}
      onBottomTextPress={() => {
        navigate(SCREENS.SIGN_UP);
      }}
    >
      <FocusProvider>
        {/* <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL_ADDRESS}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          keyboardType={'email-address'}
          autoCapitalize='none'
          autoCorrect={false}
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'email-outline',
            }}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        /> */}
        <PhoneInputComponent
          name={COMMON_TEXT.PHONE_NUMBER}
          title={COMMON_TEXT.PHONE_NUMBER}
          editable={true}
          onChangeText={formik.handleChange('phone_number')}
          value={formik.values.phone_number}
          // onBlur={formik.handleBlur('phone_number')}
          allowSpacing={false}
          onChangeCountryCode={formik.handleChange('country_code')}
          onChangeCallingCode={formik.handleChange('calling_code')}
          defaultCode={(formik.values.country_code || 'NG') as any}
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
          returnKeyType='done'
          allowSpacing={false}
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.PLACEHOLDER,
            size: FontSize.MediumLarge,
            onPress: () => {
              formik.setFieldValue('showPassword', !formik.values.showPassword);
            },
          }}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock',
          }}
          secureTextEntry={!formik.values.showPassword}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
      </FocusProvider>
      <RowComponent style={styles.row}>
        {/* <Checkbox
          style={styles.checkbox}
          label={COMMON_TEXT.REMEMBER_ME}
          checked={formik.values.rememberMe}
          onChange={checked => formik.setFieldValue('rememberMe', checked)}
        /> */}
        <View />
        <RowComponent>
          <Typography
            onPress={() => {
              navigate(SCREENS.FORGOT_PASSWORD);
            }}
            style={styles.forgotPassword}
          >
            {COMMON_TEXT.FORGOT_PASSWORD}
          </Typography>
          <Typography
            onPress={() => {
              navigate(SCREENS.FORGOT_PASSWORD);
            }}
            style={styles.forgotPassword}
          >
            ?
          </Typography>
        </RowComponent>
      </RowComponent>
      <Button
        loading={loading}
        title={COMMON_TEXT.LOGIN}
        onPress={onPress}
        style={[styles.row, styles.button]}
      />

      {/* <RowComponent style={{ gap: 10, alignItems: 'center', marginBottom: 30 }}>
        <View style={styles.line} />
        <Typography style={styles.orLoginWith}>{COMMON_TEXT.OR_LOGIN_WITH}</Typography>
        <View style={styles.line} />
      </RowComponent>
      <SocialButton
        buttonName={COMMON_TEXT.LOGIN_WITH_GOOGLE}
        svgName={SVG.GOOGLE}
        onPress={async () => {
          const payload = await GoogleSignIn(role);
          if (payload) await loginUserThroughSocial({ data: payload });
        }}
      />
      <SocialButton
        buttonName={COMMON_TEXT.LOGIN_WITH_APPLE}
        svgName={SVG.APPLE}
        onPress={async () => {
          const payload = await AppleSignIn(role);
          if (payload) await loginUserThroughSocial({ data: payload });
        }}
      /> */}
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  checkbox: {},
  forgotPassword: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumSmall,
  },
  row: {
    marginBottom: 35,
  },
  line: {
    width: screenWidth(30),
    height: 0.6,
    backgroundColor: COLORS.BORDER,
  },
  orLoginWith: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
  },
  button: {
    marginHorizontal: 20,
  },
});
