import { StyleSheet } from 'react-native';
import { COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import { COLORS, resetPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent } from 'components/index';
import { reset } from 'navigation/Navigators';
// import { resetUserPassword } from 'api/functions/auth';

interface ResetPasswordFormValues {
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
}

export const ResetPassword = () => {
  const initialValues: ResetPasswordFormValues = {
    new_password: __DEV__ ? 'Passward123!' : '',
    confirm_password: __DEV__ ? 'Passward123!' : '',
    showConfirmPassword: false,
    showNewPassword: false,
  };

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    const data = {
      password: values?.new_password,
      password_confirmation: values?.confirm_password,
    };
    // resetUserPassword({data});

    reset(SCREENS.LOGIN);
  };

  const formik = useFormikForm<ResetPasswordFormValues>({
    initialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthComponent
      description={COMMON_TEXT.RESET_YOUR_PASSWORD_WITH}
      showLogo={false}
      descriptionStyle={{
        textAlign: 'left',
      }}
      containerStyle={{
        marginTop: 0,
      }}
    >
      <FocusProvider>
        <Input
          name={COMMON_TEXT.NEW_PASSWORD}
          title={COMMON_TEXT.NEW_PASSWORD}
          onChangeText={formik.handleChange('new_password')}
          onBlur={formik.handleBlur('new_password')}
          value={formik.values.new_password}
          allowSpacing={false}
          placeholder={COMMON_TEXT.ENTER_NEW_PASSWORD}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showNewPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () => formik.setFieldValue('showNewPassword', !formik.values.showNewPassword),
          }}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
          secureTextEntry={!formik.values.showNewPassword}
          error={formik.errors.new_password}
          touched={Boolean(formik.touched.new_password && formik.submitCount)}
        />
        <Input
          name={COMMON_TEXT.CONFIRM_PASSWORD}
          title={COMMON_TEXT.CONFIRM_PASSWORD}
          onChangeText={formik.handleChange('confirm_password')}
          onBlur={formik.handleBlur('confirm_password')}
          value={formik.values.confirm_password}
          allowSpacing={false}
          returnKeyType='done'
          placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'lock1',
          }}
          endIcon={{
            componentName: VARIABLES.Ionicons,
            iconName: formik.values.showConfirmPassword ? 'eye' : 'eye-off',
            color: COLORS.ICONS,
            size: FontSize.MediumLarge,
            onPress: () =>
              formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword),
          }}
          secureTextEntry={!formik.values.showConfirmPassword}
          error={formik.errors.confirm_password}
          touched={Boolean(formik.touched.confirm_password && formik.submitCount)}
        />
      </FocusProvider>
      <Button  loading={true} title={COMMON_TEXT.UPDATE} onPress={formik.handleSubmit} style={styles.button} />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 30,
  },
});
