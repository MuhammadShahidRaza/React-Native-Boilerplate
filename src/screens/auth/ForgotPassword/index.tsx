import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, VARIABLES, isSengoBrand } from 'constants/index';
import { forgotPasswordValidationSchema, buildPhonePayload } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { Button, GradientButton, AuthComponent, PhoneInputComponent } from 'components/index';
// import { sendOtpToEmail } from 'api/functions/auth';
import { forgotPassword } from 'api/functions/auth';

interface ForgotPasswordFormValues {
  phone_number: string;
  country_code: string;
  calling_code: string;
}

export const ForgotPassword = () => {
  const initialValues: ForgotPasswordFormValues = {
    phone_number: '',
    country_code: 'US',
    calling_code: '',
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    await forgotPassword({ data: buildPhonePayload(values) });
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
      heading1={COMMON_TEXT.FORGOT_PASSWORD}
      description={AUTH_TEXT.RESET_YOUR_PASSWORD}
      descriptionStyle={{ marginBottom: 50, textAlign: 'left' }}
    containerStyle={{ marginTop: 30 }}
      bottomButtonText=''
      bottomText=''
    >
      <FocusProvider>
        <PhoneInputComponent
          name={COMMON_TEXT.PHONE_NUMBER}
          title={COMMON_TEXT.PHONE_NUMBER}
          onChangeText={formik.handleChange('phone_number')}
          value={formik.values.phone_number}
          // onBlur={formik.handleBlur('phone_number')}
          onChangeCountryCode={formik.handleChange('country_code')}
          onChangeCallingCode={formik.handleChange('calling_code')}
          defaultCode={(formik.values.country_code || 'US') as any}
          allowSpacing={false}
          returnKeyType='go'
          placeholder={COMMON_TEXT.PHONE_NUMBER}
          error={formik.errors.phone_number}
          touched={Boolean(formik.touched.phone_number && formik.submitCount)}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
          }}
        />
      </FocusProvider>
      {isSengoBrand() ? (
        <GradientButton
          loading={loading}
          title={COMMON_TEXT.SEND_OTP}
          onPress={onPress}
          style={[styles.button, { alignSelf: 'stretch' }]}
        />
      ) : (
        <Button
          loading={loading}
          title={COMMON_TEXT.SEND_OTP}
          onPress={onPress}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      )}
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
