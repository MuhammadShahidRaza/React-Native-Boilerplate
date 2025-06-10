import { StyleSheet, View } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, VARIABLES, SCREENS } from 'constants/index';
import {
  loginValidationSchema,
  COLORS,
  screenWidth,
  // getFCMToken,
  clearAllStorageItems,
  // deviceDetails,
} from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Typography, Input, AuthComponent, RowComponent } from 'components/index';
import { navigate } from 'navigation/index';
import { Checkbox } from 'components/common/Checkbox';

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
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      // device_token: await getFCMToken(),
      // ...deviceDetails(),
    };
    // loginUser({ data, rememberMe: values?.rememberMe });
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
      }}
    >
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
          startIcon={{
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'email-outline',
          }}
          touched={Boolean(formik.touched.email && formik.submitCount)}
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
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.INPUT_FIELD_TEXT,
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
      <View style={{ alignSelf: 'center' }}>
        <Button title={COMMON_TEXT.SIGN_IN} onPress={formik.handleSubmit} style={styles.row} />
      </View>
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  checkbox: {},
  forgotPassword: {
    color: COLORS.SECONDARY,
    fontSize: FontSize.Medium,
  },
  row: {
    marginBottom: 18,
    marginTop: 15,
    // alignSelf:'center',
    justifyContent: 'space-between',
  },
  line: {
    width: screenWidth(25),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
});
