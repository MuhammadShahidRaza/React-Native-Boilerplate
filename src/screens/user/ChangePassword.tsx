
import { StyleSheet, ScrollView, View } from 'react-native';
import { COMMON_TEXT, VARIABLES } from 'constants/index';
import { COLORS, resetPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, Wrapper, Header } from 'components/index';

interface ChangePasswordFormValues {
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
}

export const ChangePassword = () => {
  const initialValues: ChangePasswordFormValues = {
    new_password: __DEV__ ? 'Passward123!' : '',
    confirm_password: __DEV__ ? 'Passward123!' : '',
    showConfirmPassword: false,
    showNewPassword: false,
  };

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    const data = {
      password: values?.new_password,
      password_confirmation: values?.confirm_password,
    };
    // resetUserPassword({data});
  };

  const formik = useFormikForm<ChangePasswordFormValues>({
    initialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Wrapper>
      <Header title={'Change Password'} />

      <View style={styles.container}>
        {/* Scrollable inputs */}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FocusProvider>
            <Input
              name={'Current Password'}
              title={'Current Password'}
              onChangeText={formik.handleChange('new_password')}
              onBlur={formik.handleBlur('new_password')}
              value={formik.values.new_password}
              allowSpacing={false}
              placeholder={COMMON_TEXT.ENTER_NEW_PASSWORD}
              startIcon={{
                componentName: VARIABLES.AntDesign,
                iconName: 'lock1',
              }}
              endIcon={{
                componentName: VARIABLES.Ionicons,
                iconName: formik.values.showNewPassword ? 'eye' : 'eye-off',
                color: COLORS.ICONS,
                size: FontSize.MediumLarge,
                onPress: () => formik.setFieldValue('showNewPassword', !formik.values.showNewPassword),
              }}
              secureTextEntry={!formik.values.showNewPassword}
              error={formik.errors.new_password}
              touched={Boolean(formik.touched.new_password && formik.submitCount)}
            />

            <Input
              name={COMMON_TEXT.NEW_PASSWORD}
              title={COMMON_TEXT.NEW_PASSWORD}
              onChangeText={formik.handleChange('new_password')}
              onBlur={formik.handleBlur('new_password')}
              value={formik.values.new_password}
              allowSpacing={false}
              placeholder={COMMON_TEXT.ENTER_NEW_PASSWORD}
              startIcon={{
                componentName: VARIABLES.AntDesign,
                iconName: 'lock1',
              }}
              endIcon={{
                componentName: VARIABLES.Ionicons,
                iconName: formik.values.showNewPassword ? 'eye' : 'eye-off',
                color: COLORS.ICONS,
                size: FontSize.MediumLarge,
                onPress: () => formik.setFieldValue('showNewPassword', !formik.values.showNewPassword),
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
              returnKeyType="done"
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
        </ScrollView>

        {/* Fixed Footer Button */}
        <View style={styles.footer}>
          <Button
            title={COMMON_TEXT.SAVE}
            onPress={formik.handleSubmit}
            style={styles.button}
          />
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: COLORS.WHITE,
  },
  button: {
    alignSelf: 'center',
  },
  descriptionStyles: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.ICONS,
  },
});
