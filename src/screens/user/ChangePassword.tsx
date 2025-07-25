import { StyleSheet, View } from 'react-native';
import { COMMON_TEXT, VARIABLES } from 'constants/index';
import { COLORS, changePasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, Wrapper } from 'components/index';
import { STYLES } from 'utils/commonStyles';
import { updatePassword } from 'api/functions/app/user';

interface ChangePasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
  showCurrentPassword: boolean;
}

export const ChangePassword = () => {
  const initialValues: ChangePasswordFormValues = {
    current_password: '',
    new_password: '',
    confirm_password: '',
    showConfirmPassword: false,
    showNewPassword: false,
    showCurrentPassword: false,
  };

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    updatePassword({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  };

  const formik = useFormikForm<ChangePasswordFormValues>({
    initialValues,
    validationSchema: changePasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <Wrapper useSafeArea={true}>
        <View style={STYLES.CONTAINER}>
          <FocusProvider>
            <Input
              startIcon={{
                componentName: VARIABLES.AntDesign,
                iconName: 'lock1',
              }}
              name={COMMON_TEXT.CURRENT_PASSWORD}
              title={COMMON_TEXT.CURRENT_PASSWORD}
              onChangeText={formik.handleChange('current_password')}
              onBlur={formik.handleBlur('current_password')}
              value={formik.values.current_password}
              allowSpacing={false}
              placeholder={COMMON_TEXT.ENTER_CURRENT_PASSWORD}
              endIcon={{
                componentName: VARIABLES.Ionicons,
                iconName: formik.values.showCurrentPassword ? 'eye' : 'eye-off',
                color: COLORS.ICONS,
                size: FontSize.MediumLarge,
                onPress: () =>
                  formik.setFieldValue('showCurrentPassword', !formik.values.showCurrentPassword),
              }}
              secureTextEntry={!formik.values.showCurrentPassword}
              error={formik.errors.current_password}
              touched={Boolean(formik.touched.current_password && formik.submitCount)}
            />
            <Input
              startIcon={{
                componentName: VARIABLES.AntDesign,
                iconName: 'lock1',
              }}
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
                onPress: () =>
                  formik.setFieldValue('showNewPassword', !formik.values.showNewPassword),
              }}
              secureTextEntry={!formik.values.showNewPassword}
              error={formik.errors.new_password}
              touched={Boolean(formik.touched.new_password && formik.submitCount)}
            />
            <Input
              startIcon={{
                componentName: VARIABLES.AntDesign,
                iconName: 'lock1',
              }}
              name={COMMON_TEXT.CONFIRM_PASSWORD}
              title={COMMON_TEXT.CONFIRM_PASSWORD}
              onChangeText={formik.handleChange('confirm_password')}
              onBlur={formik.handleBlur('confirm_password')}
              value={formik.values.confirm_password}
              allowSpacing={false}
              returnKeyType='done'
              placeholder={COMMON_TEXT.ENTER_CONFIRM_PASSWORD}
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
        </View>
      </Wrapper>
      <Button
        loading={true}
        title={COMMON_TEXT.UPDATE}
        onPress={formik.handleSubmit}
        style={styles.button}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 50,
    marginHorizontal: 20,
  },
});
