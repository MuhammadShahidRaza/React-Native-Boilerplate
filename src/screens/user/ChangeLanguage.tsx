import { StyleSheet, View } from 'react-native';
import { COMMON_TEXT, IMAGES, VARIABLES } from 'constants/index';
import { COLORS, resetPasswordValidationSchema } from 'utils/index';
import { FocusProvider, useFormikForm } from 'hooks/index';
import { FontSize } from 'types/fontTypes';
import { Button, Input, AuthComponent, Wrapper, Header, Typography } from 'components/index';
import { LanguageSelectorButton } from 'components/common/LanguageSelectorButton';

interface ChangePasswordFormValues {
  new_password: string;
  confirm_password: string;
  showConfirmPassword: boolean;
  showNewPassword: boolean;
}

export const ChangeLanguage = () => {
  const initialValues: ChangePasswordFormValues = {
    new_password: __DEV__ ? 'Passward123!' : '',
    confirm_password: __DEV__ ? 'Passward123!' : '',
    showConfirmPassword: false,
    showNewPassword: false,
  };

  const formik = useFormikForm<ChangePasswordFormValues>({
    initialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async values => {
      const data = {
        password: values?.new_password,
        password_confirmation: values?.confirm_password,
      };
      // resetUserPassword({data});
    },
  });

  return (
    <Wrapper>
      <Header title={'Change Language'} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Typography style={styles.description}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi'
            }
          </Typography>

          <View style={styles.languageButtons}>
            <LanguageSelectorButton language={'English'} flag={IMAGES.ENGLISH} />
            <LanguageSelectorButton language={'Arabic'} flag={IMAGES.ARABIC_FLAG} />
          </View>
        </View>

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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: FontSize.Small,
    color: COLORS.LANGUAGE_COLOR,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    alignSelf: 'center',

  },
});
