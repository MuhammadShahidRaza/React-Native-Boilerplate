import {StyleSheet} from 'react-native';
import {AUTH_TEXT, COMMON_TEXT} from 'constants/index';
import {forgotPasswordValidationSchema} from 'utils/index';
import {FocusProvider, useFormikForm} from 'hooks/index';
import {Button, Input, AuthComponent} from 'components/index';
import {sendOtpToEmail} from 'api/functions/auth';

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
    sendOtpToEmail({data});
  };

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      heading1={COMMON_TEXT.FORGOT_PASSWORD}
      description={AUTH_TEXT.DONT_WORRY_FORGOT}>
      <FocusProvider>
        <Input
          name={COMMON_TEXT.EMAIL}
          title={COMMON_TEXT.EMAIL}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          value={formik.values.email}
          allowSpacing={false}
          returnKeyType="done"
          keyboardType={'email-address'}
          placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
          error={formik.errors.email}
          touched={Boolean(formik.touched.email && formik.submitCount)}
        />
      </FocusProvider>
      <Button
        title={COMMON_TEXT.SEND_OTP}
        onPress={formik.handleSubmit}
        style={styles.button}
      />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 25,
  },
});
