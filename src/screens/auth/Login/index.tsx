import {StyleSheet, View} from 'react-native';
import {AUTH_TEXT, COMMON_TEXT, VARIABLES, SVG, SCREENS} from 'constants/index';
import {
  loginValidationSchema,
  COLORS,
  screenWidth,
  getFCMToken,
  clearAllStorageItems,
} from 'utils/index';
import {FocusProvider, useFormikForm} from 'hooks/index';
import {FontSize} from 'types/fontTypes';
import {
  Button,
  Checkbox,
  Typography,
  Input,
  AuthComponent,
  RowComponent,
  SocialButton,
} from 'components/index';
import {navigate} from 'navigation/index';
import {loginUser, loginUserThroughSocial} from 'api/functions/auth';
import {GoogleSignIn} from 'utils/helpers';
import {deviceDetails} from '../../../utils/helpers/functions';
import {PROVIDERS} from 'types/common';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
}

export const Login = () => {
  const initialValues: LoginFormValues = {
    email: __DEV__ ? 'shahid@mailinator.com' : '',
    password: __DEV__ ? 'Passward123!' : '',
    showPassword: false,
    rememberMe: true,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    clearAllStorageItems()
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      device_token: await getFCMToken(),
      ...deviceDetails(),
    };
    loginUser({data, rememberMe: values?.rememberMe});
  };

  const formik = useFormikForm<LoginFormValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      heading1={AUTH_TEXT.WELCOME_BACK_LOGIN}
      description={AUTH_TEXT.HELLO_AGAIN_LOGIN}
      bottomText={COMMON_TEXT.DONT_HAVE_AN_ACCOUNT}
      bottomButtonText={COMMON_TEXT.SIGN_UP}
      onBottomTextPress={() => {
        navigate(SCREENS.SIGN_UP);
      }}>
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.PASSWORD}
          title={COMMON_TEXT.PASSWORD}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          value={formik.values.password}
          returnKeyType="done"
          allowSpacing={false}
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () => {
              formik.setFieldValue('showPassword', !formik.values.showPassword);
            },
          }}
          secureTextEntry={!formik.values.showPassword}
          error={formik.errors.password}
          touched={Boolean(formik.touched.password && formik.submitCount)}
        />
      </FocusProvider>
      <RowComponent style={styles.row}>
        <Checkbox
          style={styles.checkbox}
          label={COMMON_TEXT.REMEMBER_ME}
          checked={formik.values.rememberMe}
          onChange={checked => formik.setFieldValue('rememberMe', checked)}
        />
        <Typography
          onPress={() => {
            navigate(SCREENS.FORGOT_PASSWORD);
          }}
          style={styles.forgotPassword}>
          {COMMON_TEXT.FORGOT_PASSWORD}
        </Typography>
      </RowComponent>
      <Button
        title={COMMON_TEXT.LOGIN}
        onPress={formik.handleSubmit}
        style={styles.row}
      />

      <RowComponent style={styles.row}>
        <View style={styles.line} />
        <Typography>{COMMON_TEXT.OR_CONTINUE_WITH}</Typography>
        <View style={styles.line} />
      </RowComponent>

      <RowComponent style={styles.row}>
        <SocialButton
          onPress={async () => {
            const user = await GoogleSignIn();
            if (user?.social_id) {
              const data: SocialLogin = {
                ...user,
                provider: PROVIDERS.GOOGLE,
                device_token: await getFCMToken(),
                ...deviceDetails(),
              };
              loginUserThroughSocial({data});
            }
          }}
          svgName={SVG.GOOGLE}
          buttonName={COMMON_TEXT.GOOGLE}
        />
        <SocialButton
          onPress={async () => {
            // const user = await AppleSignIn();
            // if (user?.social_id) {
            //   const data: SocialLogin = {
            //     ...user,
            // language_id: 1, //TODO: REMOVE THAT
            //       device_token: await getFCMToken(),
            // ...deviceDetails(),
            //   };
            //   loginUserThroughSocial({data});
            // }
          }}
          svgName={SVG.FACEBOOK}
          buttonName={COMMON_TEXT.FACEBOOK}
        />
      </RowComponent>
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  checkbox: {},
  forgotPassword: {
    color: COLORS.ERROR,
  },
  row: {
    marginBottom: 30,
  },
  line: {
    width: screenWidth(25),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
});
