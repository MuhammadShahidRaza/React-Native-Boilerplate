import { StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Input,
  Photo,
  RadioButton,
  RowComponent,
  Wrapper,
} from 'components/common';
import { COMMON_TEXT, IMAGES, VARIABLES } from 'constants/index';
import { STYLES } from 'utils/commonStyles';
import { useState } from 'react';
import { FontSize } from 'types/fontTypes';
import { screenHeight, screenWidth } from 'utils/helpers';
import { FocusProvider } from 'hooks/useFocus';
import { useFormikForm } from 'hooks/useFormik';
import { cardValidationSchema, formatCardNumber, formatExpiryDate } from 'utils/validations';

interface PaymentFormValues {
  name: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
}

export const AddCard = () => {
  const data = [
    {
      cardNumber: '**** **** **** 0890',
      expiryDate: '12/2025',
    },
    {
      cardNumber: '**** **** **** 8878',
      expiryDate: '12/2025',
    },
    {
      newCard: 'Add New Card',
    },
  ];
  const [selectedOption, setSelectedOption] = useState<string>(data[0]?.cardNumber || '');
  const [rememberCard, setRememberCard] = useState<boolean>(false);
  const initialValues: PaymentFormValues = {
    name: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
  };

  const handleSubmit = async (_: PaymentFormValues) => {};

  const formik = useFormikForm<PaymentFormValues>({
    initialValues,
    validationSchema: cardValidationSchema,
    onSubmit: handleSubmit,
  });

  const handleCardNunber = (text: string) => {
    const formattedText = formatCardNumber(text);
    formik.setFieldValue('cardNumber', formattedText);
  };

  const handleExpiryDate = (text: string) => {
    const formattedText = formatExpiryDate(text);
    formik.setFieldValue('expiryDate', formattedText);
  };

  return (
    <Wrapper useScrollView useSafeArea={true}>
      <View style={STYLES.CONTAINER}>
        <RadioButton
          containerStyle={styles.container}
          optionsContainerStyle={styles.radioButton}
          options={
            data.map(item => (item?.newCard ? 'Add New Card' : item?.cardNumber)) as string[]
          }
          onSelectOption={setSelectedOption}
          selectedOption={selectedOption}
        />

        {selectedOption === 'Add New Card' && (
          <View style={styles.addCardContainer}>
            <Photo source={IMAGES.VISA_LARGE} resizeMode='contain' imageStyle={styles.visaImage} />
            <FocusProvider>
              <Input
                name={COMMON_TEXT.NAME}
                title={COMMON_TEXT.NAME}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                value={formik.values.name}
                placeholder={COMMON_TEXT.ENTER_YOUR_NAME}
                error={formik.errors.name}
                touched={Boolean(formik.touched.name && formik.submitCount)}
                startIcon={{
                  componentName: VARIABLES.Entypo,
                  iconName: 'credit-card',
                  size: FontSize.Large,
                }}
              />
              <Input
                keyboardType='number-pad'
                name={COMMON_TEXT.CARD_NUMBER}
                title={COMMON_TEXT.CARD_NUMBER}
                onChangeText={handleCardNunber}
                maxLength={19}
                onBlur={formik.handleBlur('cardNumber')}
                value={formik.values.cardNumber}
                placeholder={COMMON_TEXT.ENTER_CARD_NUMBER}
                error={formik.errors.cardNumber}
                touched={Boolean(formik.touched.cardNumber && formik.submitCount)}
                startIcon={{
                  componentName: VARIABLES.Entypo,
                  iconName: 'credit-card',
                  size: FontSize.Large,
                }}
              />
              <RowComponent style={styles.inputRow}>
                <Input
                  keyboardType='number-pad'
                  name={COMMON_TEXT.EXPIRY_DATE}
                  maxLength={5}
                  title={COMMON_TEXT.EXPIRY_DATE}
                  containerStyle={styles.inputField}
                  onChangeText={handleExpiryDate}
                  onBlur={formik.handleBlur('expiryDate')}
                  value={formik.values.expiryDate}
                  placeholder={COMMON_TEXT.ENTER_EXPIRY_DATE}
                  error={formik.errors.expiryDate}
                  touched={Boolean(formik.touched.expiryDate && formik.submitCount)}
                  startIcon={{
                    componentName: VARIABLES.Entypo,
                    iconName: 'credit-card',
                    size: FontSize.Large,
                  }}
                />
                <Input
                  keyboardType='number-pad'
                  name={COMMON_TEXT.CVV}
                  title={COMMON_TEXT.CVV}
                  containerStyle={styles.inputField}
                  onChangeText={formik.handleChange('cvv')}
                  maxLength={3}
                  onBlur={formik.handleBlur('cvv')}
                  value={formik.values.cvv}
                  placeholder={COMMON_TEXT.ENTER_YOUR_CVV}
                  error={formik.errors.cvv}
                  touched={Boolean(formik.touched.cvv && formik.submitCount)}
                  startIcon={{
                    componentName: VARIABLES.Entypo,
                    iconName: 'credit-card',
                    size: FontSize.Large,
                  }}
                />
              </RowComponent>

              <Checkbox
                onChange={setRememberCard}
                label={'Remember this card for future purchases'}
                checked={rememberCard}
                style={styles.checkboxContainer}
              />
            </FocusProvider>
          </View>
        )}
        <Button
          title={selectedOption === 'Add New Card' ? COMMON_TEXT.SAVE : COMMON_TEXT.PAY}
          onPress={selectedOption === 'Add New Card' ? formik.handleSubmit : () => {}}
          style={styles.payNowButton}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  radioButton: {
    justifyContent: 'flex-start',
  },
  addCardContainer: {},
  inputField: {
    width: screenWidth(43),
  },
  inputRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  payNowButton: {
    marginVertical: 50,
  },

  visaImage: {
    width: screenWidth(90),
    height: screenHeight(30),
    resizeMode: 'contain',
  },
  checkboxContainer: {
    marginTop: 10,
  },
});
