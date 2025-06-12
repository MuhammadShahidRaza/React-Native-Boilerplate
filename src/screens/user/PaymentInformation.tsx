import {
  Button,
  Checkbox,
  Header,
  Input,
  PhoneInputComponent,
  RadioButton,
  RowComponent,
  Wrapper,
} from 'components/common';
import { IMAGES } from 'constants/assets';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { FocusProvider } from 'hooks/useFocus';
import { useFormikForm } from 'hooks/useFormik';
import { onBack } from 'navigation/Navigators';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenWidth } from 'utils/helpers';
import { AddressDetails } from 'utils/location';
import { editProfileValidationSchema } from 'utils/validations';

interface EditProfileFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: AddressDetails | null;
}

export const PaymentInformation = () => {
  const initialValues: EditProfileFormValues = {
    email: 'shahid@gmail.com',
    firstName: 'Shahid',
    lastName: 'Raza',
    phoneNumber: '',
    location: null,
  };

  const formik = useFormikForm<EditProfileFormValues>({
    initialValues,
    validationSchema: editProfileValidationSchema,
    onSubmit: async values => {
      onBack();
    },
  });

  return (
    <Wrapper>
      <Header title={'Payment Information'} />

      <View style={styles.container}>
        {/* Scrollable form content */}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            {/* <RadioButton
                          containerStyle={styles.radioButtonContainer}
                          // optionsContainerStyle={styles.radioButtonOptionsContainer}
                          options={languages}
                          selectedOption={languages[0] || languages[0]?.name}
                          onSelectOption={() => { }}
                        /> */}
          <Image
            source={IMAGES.IMAGE_UPLOAD}
            resizeMode="contain"
            style={styles.image}
          />

          <FocusProvider>
            <Input
              titleStyle={styles.title}
              name={COMMON_TEXT.EMAIL}
              title={'Card Number'}
              editable={false}
              onChangeText={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              value={'Enter Card Number'}
              allowSpacing={false}
              keyboardType={'email-address'}
              placeholder={'Enter Card Number '}
              error={formik.errors.email}
              touched={Boolean(formik.touched.email && formik.submitCount)}
             
            />

            <Input
              titleStyle={styles.title}
              name={COMMON_TEXT.EMAIL}
              title={'Card Holder Name '}
              editable={false}
              onChangeText={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              value={'Enter Holder Name'}
              allowSpacing={false}
              keyboardType={'email-address'}
              placeholder={'Enter Holder Name'}
              error={formik.errors.email}
              touched={Boolean(formik.touched.email && formik.submitCount)}
              
            />
<RowComponent style={styles.row}>
              <Input
                titleStyle={styles.title}
                name={COMMON_TEXT.FIRST_NAME}
                title={'Expired'}
                containerStyle={styles.nameinput}
                onChangeText={formik.handleChange('firstName')}
                onBlur={formik.handleBlur('firstName')}
                value={'MM/YY'}
                placeholder={'MM/YY '}
                error={formik.errors.firstName}
                touched={Boolean(formik.touched.firstName && formik.submitCount)}
                
              />

              <Input
                titleStyle={styles.title}
                name={'CVV'}
                title={'CVV Code'}
                containerStyle={styles.nameinput}
                onChangeText={formik.handleChange('lastName')}
                onBlur={formik.handleBlur('lastName')}
                value={'CVV'}
                placeholder={'CVV'}
                error={formik.errors.lastName}
                touched={Boolean(formik.touched.lastName && formik.submitCount)}
                
              />
            </RowComponent>
            <Checkbox
                      label={'Remember this card details.'}
                      
                      labelStyle={styles.forgotPassword}
                      checkboxStyle={{ borderColor: COLORS.PRIMARY, borderWidth: 3, borderRadius: 7 }}
                      onChange={checked => formik.setFieldValue('rememberMe', checked)}
                    />
          </FocusProvider>
        </ScrollView>

        {/* Fixed footer */}
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    alignSelf: 'center',
  },
  image: {
    height: 95,
    marginBottom: 30,
    alignSelf: 'center',
  },
  nameinput: {
    width: screenWidth(43),
  },
  row: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontWeight: FontWeight.Normal,
  },
});
