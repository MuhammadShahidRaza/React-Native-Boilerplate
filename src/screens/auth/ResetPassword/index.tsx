import { StyleSheet } from 'react-native';
import { COMMON_TEXT, ENV_CONSTANTS, SCREENS, VARIABLES } from 'constants/index';
import { COLORS, removeKeychainItem, resetPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm, useAsyncButton, useResetStackOnBack } from 'hooks/index';
import { FontSize, AppScreenProps } from 'types/index';
import { Button, Input, AuthComponent } from 'components/index';
import { resetUserPassword } from 'api/functions/auth';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { useState } from 'react';
import { onBack } from 'navigation/index';

interface ResetPasswordFormValues {
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
}

export const ResetPassword = ({
  route,
  navigation,
}: AppScreenProps<typeof SCREENS.RESET_PASSWORD>) => {
  const data = route?.params?.data;
  const initialValues: ResetPasswordFormValues = {
    new_password: __DEV__ ? 'Passward123!' : '',
    confirm_password: __DEV__ ? 'Passward123!' : '',
    showConfirmPassword: false,
    showNewPassword: false,
  };

  const [isVisible, setIsVisible] = useState(false);
  const handleSubmit = async (values: ResetPasswordFormValues) => {
    const payload = {
      password: values?.new_password,
      ...data,
    };

    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setIsVisible(true);
      return;
    }

    const response = await resetUserPassword({ data: payload });
    if (response) {
      setIsVisible(true);
    }
  };

  const formik = useFormikForm<ResetPasswordFormValues>({
    initialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  useResetStackOnBack(navigation, {
    index: 1,
    routes: [{ name: SCREENS.GET_STARTED }, { name: SCREENS.LOGIN }],
  });

  return (
    <AuthComponent
      heading1={COMMON_TEXT.RESET_PASSWORD}
      description={COMMON_TEXT.RESET_YOUR_PASSWORD_WITH}
      showLogo={false}
      descriptionStyle={{ marginBottom: 50, textAlign: 'left' }}
      containerStyle={{ marginTop: 50 }}
      bottomButtonText=''
      bottomText=''
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
          // startIcon={{
          //   componentName: VARIABLES.AntDesign,
          //   iconName: 'lock1',
          // }}
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
          // startIcon={{
          //   componentName: VARIABLES.AntDesign,
          //   iconName: 'lock1',
          // }}
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
      <Button
        loading={loading}
        title={COMMON_TEXT.UPDATE}
        onPress={onPress}
        style={styles.button}
      />

      <SuccessFailureModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => {
          removeKeychainItem(VARIABLES.USER_TOKEN);
          onBack();
        }}
        title={COMMON_TEXT.PASSWORD_UPDATED_SUCCESSFULLY}
        description={COMMON_TEXT.YOUR_PASSWORD_HAS_BEEN_UPDATED_SUCCESSFULLY}
        primaryButtonText={COMMON_TEXT.BACK_TO_LOGIN}
        wantTwoButtons={false}
        iconStyle={{ componentName: VARIABLES.Entypo, iconName: 'check', color: COLORS.BACKGROUND }}
      />
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
});
