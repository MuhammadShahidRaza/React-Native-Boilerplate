import {StyleSheet} from 'react-native';
import {AUTH_TEXT, COMMON_TEXT, VARIABLES} from 'constants/index';
import {
  COLORS,
  deviceDetails,
  getFCMToken,
  screenWidth,
  signUpValidationSchema,
} from 'utils/index';
import {FocusProvider, useFormikForm} from 'hooks/index';
import {FontSize} from 'types/fontTypes';
import {
  Button,
  Input,
  AuthComponent,
  RowComponent,
  PhoneInputComponent,
} from 'components/index';
import {signUpUser} from 'api/functions/auth';

interface SignUpFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export const SignUp = () => {
  const initialValues: SignUpFormValues = {
    email: __DEV__ ? 'shahid@mailinator.com' : '',
    password: __DEV__ ? 'Passward123!' : '',
    first_name: __DEV__ ? 'Shahid' : '',
    last_name: __DEV__ ? 'Raza' : '',
    phoneNumber: '24244562',
    confirmPassword: __DEV__ ? 'Passward123!' : '',
    showPassword: false,
    showConfirmPassword: false,
  };

  const handleSubmit = async (values: SignUpFormValues) => {
    const data: Login_SignUp = {
      email: values?.email,
      password: values?.password,
      first_name: values?.first_name,
      last_name: values?.last_name,
      phone: values?.phoneNumber,
      device_token: await getFCMToken(),
      ...deviceDetails(),
    };
    signUpUser({data});
  };
  const formik = useFormikForm<SignUpFormValues>({
    initialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      heading1={COMMON_TEXT.CREATE_AN_ACCOUNT}
      description={AUTH_TEXT.CONNECT_WITH_SIGNUP}>
      <FocusProvider>
        <RowComponent style={styles.row}>
          <Input
            name={COMMON_TEXT.FIRST_NAME}
            title={COMMON_TEXT.FIRST_NAME}
            containerStyle={styles.nameinput}
            onChangeText={formik.handleChange('first_name')}
            onBlur={formik.handleBlur('first_name')}
            value={formik.values.first_name}
            placeholder={COMMON_TEXT.ENTER_FIRST_NAME}
            error={formik.errors.first_name}
            touched={Boolean(formik.touched.first_name && formik.submitCount)}
          />
          <Input
            name={COMMON_TEXT.LAST_NAME}
            title={COMMON_TEXT.LAST_NAME}
            containerStyle={styles.nameinput}
            onChangeText={formik.handleChange('last_name')}
            onBlur={formik.handleBlur('last_name')}
            value={formik.values.last_name}
            placeholder={COMMON_TEXT.ENTER_LAST_NAME}
            error={formik.errors.last_name}
            touched={Boolean(formik.touched.last_name && formik.submitCount)}
          />
        </RowComponent>
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

        <PhoneInputComponent
          name={COMMON_TEXT.PHONE_NUMBER}
          title={COMMON_TEXT.PHONE_NUMBER}
          onChangeText={formik.handleChange('phoneNumber')}
          value={formik.values.phoneNumber}
          allowSpacing={false}
          placeholder={COMMON_TEXT.ENTER_YOUR_PHONE_NUMBER}
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
          placeholder={COMMON_TEXT.ENTER_YOUR_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showPassword', !formik.values.showPassword),
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
          placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
          returnKeyType="done"
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showConfirmPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue(
                'showConfirmPassword',
                !formik.values.showConfirmPassword,
              ),
          }}
          secureTextEntry={!formik.values.showConfirmPassword}
          error={formik.errors.confirmPassword}
          touched={Boolean(
            formik.touched.confirmPassword && formik.submitCount,
          )}
        />
      </FocusProvider>
      {/* <RowComponent style={styles.row}>
        <Checkbox
          style={styles.checkbox}
          label={COMMON_TEXT.REMEMBER_ME}
          checked={formik.values.rememberMe}
          onChange={checked => formik.setFieldValue('rememberMe', checked)}
        />
      </RowComponent> */}
      <Button
        title={COMMON_TEXT.SIGN_UP}
        onPress={formik.handleSubmit}
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
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
});
