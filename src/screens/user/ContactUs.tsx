import { Button, Header, Input, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { FocusProvider } from 'hooks/useFocus';
import { useFormikForm } from 'hooks/useFormik';
import { onBack } from 'navigation/Navigators';
import { StyleSheet, View } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { STYLES } from 'utils/commonStyles';
import { screenHeight } from 'utils/helpers';
import { contactUsValidationSchema } from 'utils/validations';

interface ContactUsFormValues {
  email: string;
  subject: string;
  message: string;
}

export const ContactUs = () => {
  //   const dispatch = useAppDispatch();
  const initialValues: ContactUsFormValues = {
    email: 'shahid@gmail.com',
    subject: '',
    message: '',
  };

  const handleSubmit = async (values: ContactUsFormValues) => {
    onBack();
  };

  const formik = useFormikForm<ContactUsFormValues>({
    initialValues,
    validationSchema: contactUsValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Wrapper useScrollView>
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <Input
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'email-outline',
            }}
            name={COMMON_TEXT.EMAIL}
            title={COMMON_TEXT.EMAIL}
            editable={false}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            value={formik.values.email}
            allowSpacing={false}
            keyboardType={'email-address'}
            placeholder={COMMON_TEXT.ENTER_YOUR_EMAIL}
            error={formik.errors.email}
            touched={Boolean(formik.touched.email && formik.submitCount)}
          />
          <Input
            name={'Subject'}
            title={'Subject'}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'message-circle',
              iconStyle: {
                padding: 10,
                fontSize: FontSize.ExtraLarge,
                transform: [{ scaleX: -1 }],
              },
            }}
            onChangeText={formik.handleChange('subject')}
            onBlur={formik.handleBlur('subject')}
            value={formik.values.subject}
            placeholder={'Enter Subject'}
            error={formik.errors.subject}
            touched={Boolean(formik.touched.subject && formik.submitCount)}
          />

          <Input
            name={COMMON_TEXT.MESSAGE}
            startIcon={{
              componentName: VARIABLES.MaterialCommunityIcons,
              iconName: 'message-reply-text-outline',
            }}
            title={COMMON_TEXT.MESSAGE}
            onChangeText={formik.handleChange('message')}
            onBlur={formik.handleBlur('message')}
            value={formik.values.message}
            placeholder={COMMON_TEXT.ENTER_YOUR_MESSAGE}
            maxLines={15}
            style={{ height: screenHeight(20) }}
            textAlignVertical='top'
            error={formik.errors.message}
            touched={Boolean(formik.touched.message && formik.submitCount)}
          />
        </FocusProvider>

        <Button title={COMMON_TEXT.SUBMIT} onPress={formik.handleSubmit} style={styles.button} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 30,
  },
});
