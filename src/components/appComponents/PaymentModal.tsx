import { View, StyleSheet } from 'react-native';
import { ModalComponent } from '../common/Modal';
import { Typography } from '../common/Typography';
import { COMMON_TEXT } from '../../constants/screens/index';
import { screenWidth } from '../../utils/helpers/functions';
import { FontSize, FontWeight } from 'types/fontTypes';
import { SocialButton } from './AuthComponent';
import { SVG } from 'constants/assets';
import { Button, Input, RowComponent } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { useFormikForm } from 'hooks/useFormik';
import { cardValidationSchema, formatCardNumber, formatExpiryDate } from 'utils/validations';
import { FocusProvider } from 'hooks/useFocus';

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (visible: boolean) => void;
  isFromBooking?: boolean;
}

interface PaymentFormValues {
  name: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  isFromBooking = false,
}) => {
  const initialValues: PaymentFormValues = {
    name: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
  };

  const handleSubmit = async (_: PaymentFormValues) => {
    setShowPaymentModal(false);
    if (isFromBooking) {
      // replace(SCREENS.BOOKING_DETAILS);
      return;
    }
    // replace(SCREENS.COURSE_DETAILS);
  };

  const formik = useFormikForm<PaymentFormValues>({
    initialValues,
    validationSchema: cardValidationSchema,
    onSubmit: handleSubmit,
  });

  console.log(formik.errors);
  const handleCardNunber = (text: string) => {
    const formattedText = formatCardNumber(text);
    formik.setFieldValue('cardNumber', formattedText);
  };

  const handleExpiryDate = (text: string) => {
    const formattedText = formatExpiryDate(text);
    formik.setFieldValue('expiryDate', formattedText);
  };
  return (
    <ModalComponent
      statusBarTranslucent={false}
      wantToCloseOnBack
      scroll
      wantToCloseOnTop
      modalContainerStyle={{ flex: 2 }}
      modalVisible={showPaymentModal}
      setModalVisible={setShowPaymentModal}
    >
      <View style={styles.modalContent}>
        <Typography style={styles.modalTitle}>{COMMON_TEXT.CHOOSE_PAYMENT_METHOD}</Typography>
        <RowComponent style={styles.buttonRow}>
          <SocialButton
            textStyle={styles.socialButtonText}
            onPress={() => {}}
            containerStyle={styles.socialButtonContainer}
            svgName={SVG.GOOGLE}
            buttonName={COMMON_TEXT.PAY}
          />
          {/* <Photo source={IMAGES.VISA} imageStyle={styles.visaImage} /> */}
          <Button
            startIcon={{
              componentName: VARIABLES.AntDesign,
              iconName: 'apple1',
              size: 25,
            }}
            title={COMMON_TEXT.PAY}
            style={styles.appleButton}
            textStyle={styles.appleButtonText}
          />
        </RowComponent>

        <FocusProvider>
          <Input
            titleStyle={styles.title}
            name={COMMON_TEXT.NAME}
            title={COMMON_TEXT.NAME}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            value={formik.values.name}
            placeholder={COMMON_TEXT.ENTER_YOUR_NAME}
            error={formik.errors.name}
            touched={Boolean(formik.touched.name && formik.submitCount)}
            startIcon={{
              componentName: VARIABLES.AntDesign,
              iconName: 'user',
              size: 25,
            }}
          />
          <Input
            titleStyle={styles.title}
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
              componentName: VARIABLES.AntDesign,
              iconName: 'credit-card',
              size: 25,
            }}
          />
          <RowComponent style={styles.inputRow}>
            <Input
              titleStyle={styles.title}
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
                componentName: VARIABLES.AntDesign,
                iconName: 'calendar',
                size: 25,
              }}
            />
            <Input
              titleStyle={styles.title}
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
                componentName: VARIABLES.AntDesign,
                iconName: 'lock',
                size: 25,
              }}
            />
          </RowComponent>
        </FocusProvider>

        <Button
          title={COMMON_TEXT.PAY_NOW}
          onPress={formik.handleSubmit}
          loading={true}
          style={styles.payNowButton}
        />
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    marginBottom: 10,
  },
  buttonRow: {
    marginVertical: 15,
  },
  socialButtonText: {
    fontSize: FontSize.MediumLarge,
  },
  socialButtonContainer: {
    width: screenWidth(25),
  },
  appleButton: {
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  appleButtonText: {
    color: COLORS.BLACK,
  },
  inputField: {
    width: screenWidth(43),
  },
  inputRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  payNowButton: {
    marginVertical: 10,
  },
  modalTitle: {
    fontWeight: FontWeight.Black,
    fontSize: FontSize.ExtraLarge,
    textAlign: 'center',
  },
  title: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumLarge,
  },
  visaImage: {
    width: screenWidth(20),
    height: 50,
    resizeMode: 'contain',
  },
});
