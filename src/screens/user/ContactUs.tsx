import {
  Autocomplete,
  Button,
  Header,
  Input,
  PhoneInputComponent,
  RowComponent,
  Wrapper,
} from 'components/common';
import {COMMON_TEXT} from 'constants/screens';
import {FocusProvider} from 'hooks/useFocus';
import {useFormikForm} from 'hooks/useFormik';
import {onBack} from 'navigation/Navigators';
import {StyleSheet, View} from 'react-native';
import {FontWeight} from 'types/fontTypes';
import {COLORS} from 'utils/colors';
import {STYLES} from 'utils/commonStyles';
import {screenHeight, screenWidth} from 'utils/helpers';
import {contactUsValidationSchema} from 'utils/validations';

interface ContactUsFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  message: string;
}

export const ContactUs = () => {
  //   const dispatch = useAppDispatch();
  const initialValues: ContactUsFormValues = {
    email: 'shahid@gmail.com',
    firstName: 'Shahid',
    lastName: 'Raza',
    phoneNumber: '',
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
      <Header title={COMMON_TEXT.CONTACT_US} />
      <View style={STYLES.CONTAINER}>
        <FocusProvider>
          <RowComponent style={styles.row}>
            <Input
              titleStyle={styles.title}
              name={COMMON_TEXT.FIRST_NAME}
              title={COMMON_TEXT.FIRST_NAME}
              containerStyle={styles.nameinput}
              onChangeText={formik.handleChange('firstName')}
              onBlur={formik.handleBlur('firstName')}
              value={formik.values.firstName}
              placeholder={COMMON_TEXT.ENTER_FIRST_NAME}
              error={formik.errors.firstName}
              touched={Boolean(formik.touched.firstName && formik.submitCount)}
            />
            <Input
              titleStyle={styles.title}
              name={COMMON_TEXT.LAST_NAME}
              title={COMMON_TEXT.LAST_NAME}
              containerStyle={styles.nameinput}
              onChangeText={formik.handleChange('lastName')}
              onBlur={formik.handleBlur('lastName')}
              value={formik.values.lastName}
              placeholder={COMMON_TEXT.ENTER_LAST_NAME}
              error={formik.errors.lastName}
              touched={Boolean(formik.touched.lastName && formik.submitCount)}
            />
          </RowComponent>
          <Input
            titleStyle={styles.title}
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

          <PhoneInputComponent
            titleStyle={styles.title}
            name={COMMON_TEXT.PHONE_NUMBER}
            title={COMMON_TEXT.PHONE_NUMBER}
            onChangeText={formik.handleChange('phoneNumber')}
            value={formik.values.phoneNumber}
            defaultCode={'PK'}
            allowSpacing={false}
            placeholder={COMMON_TEXT.ENTER_YOUR_PHONE_NUMBER}
            error={formik.errors.phoneNumber}
            touched={Boolean(formik.touched.phoneNumber && formik.submitCount)}
          />

          <Input
            titleStyle={styles.title}
            name={COMMON_TEXT.MESSAGE}
            title={COMMON_TEXT.MESSAGE}
            onChangeText={formik.handleChange('message')}
            onBlur={formik.handleBlur('message')}
            value={formik.values.message}
            placeholder={COMMON_TEXT.ENTER_YOUR_MESSAGE}
            maxLines={15}
            style={{height: screenHeight(20)}}
            textAlignVertical="top"
            error={formik.errors.message}
            touched={Boolean(formik.touched.message && formik.submitCount)}
          />
        </FocusProvider>

        <Button
          title={COMMON_TEXT.SUBMIT}
          onPress={formik.handleSubmit}
          style={styles.button}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    marginVertical: 30,
  },
  line: {
    width: screenWidth(100),
    height: 1,
    backgroundColor: COLORS.BLACK,
  },
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: {marginBottom: 10},
});
