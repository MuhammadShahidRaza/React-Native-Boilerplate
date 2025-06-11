import { StyleSheet } from 'react-native';
import { AUTH_TEXT, COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import { COLORS, forgotPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { Button, Input, AuthComponent } from 'components/index';
// import { sendOtpToEmail } from 'api/functions/auth';
import { navigate } from 'navigation/Navigators';
import { FontSize } from 'types/fontTypes';

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
    navigate(SCREENS.VERIFICATION);
  };

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      showLogo={false}
      heading1={AUTH_TEXT.FORGOT_PASSWORD}
      description={COMMON_TEXT.AUTH_DESC}
      descriptionStyle={styles.descriptionStyles}
      containerStyle={{ marginTop: 0 }}
      bottomText={''}
      bottomButtonText=''
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
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'email-outline',
          }}
        />
      </FocusProvider>
      <Button title={COMMON_TEXT.CONTINUE} onPress={formik.handleSubmit} style={styles.button} />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop:12,
    alignSelf:"center"
  },
  descriptionStyles:{fontSize:FontSize.MediumSmall,color:COLORS.ICONS}
});
