import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT } from 'constants/index';
import { forgotPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { Button, Input, AuthComponent } from 'components/index';
// import { sendOtpToEmail } from 'api/functions/auth';
import { forgotPassword } from 'api/functions/auth';

interface ForgotPasswordFormValues {
  email: string;
}

export const ForgotPassword = () => {
  const initialValues: ForgotPasswordFormValues = {
    email: __DEV__ ? 'shahid@mailinator.com' : '',
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    const data = {
      email: values?.email,
    };
    await forgotPassword({ data });
  };

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  return (
    <AuthComponent
      showLogo={false}
      heading1={COMMON_TEXT.FORGOT_PASSWORD}
      description={AUTH_TEXT.RESET_YOUR_PASSWORD}
      descriptionStyle={{ marginBottom: 50, textAlign: 'left' }}
      containerStyle={{ marginTop: 50 }}
      bottomButtonText=''
      bottomText=''
    >
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL_ADDRESS}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          autoCapitalize='none'
          autoCorrect={false}
          returnKeyType='go'
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
          // startIcon={{
          //   componentName: VARIABLES.AntDesign,
          //   iconName: 'lock1',
          // }}
        />
      </FocusProvider>
      <Button
        loading={loading}
        title={COMMON_TEXT.SEND_OTP}
        onPress={onPress}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 25,
    marginHorizontal: 20,
  },
  buttonText: {
    textTransform: 'none',
  },
});
