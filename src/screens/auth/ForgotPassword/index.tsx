import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import { forgotPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { Button, Input, AuthComponent } from 'components/index';
// import { sendOtpToEmail } from 'api/functions/auth';
import { navigate } from 'navigation/Navigators';

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
    // sendOtpToEmail({ data });
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
    });
  };

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      showLogo={false}
      description={AUTH_TEXT.RESET_YOUR_PASSWORD}
      descriptionStyle={{ marginBottom: 50, textAlign: 'left' }}
      containerStyle={{ marginTop: 0 }}
    >
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          returnKeyType='go'
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
        />
      </FocusProvider>
      <Button title={COMMON_TEXT.SUBMIT} onPress={formik.handleSubmit} style={styles.button} />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 25,
  },
});
