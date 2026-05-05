import { Button, Input, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { ValidationErrorModal } from 'components/appComponents';
import { COMMON_TEXT, IMAGES, SCREENS } from 'constants/index';
import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS, FLEX_CENTER, STYLES, getDentorFromBooking, showToast } from 'utils/index';
import { AppScreenProps } from 'types/navigation';
import { onBack } from 'navigation/index';
import { giveTipToDentor, getSetupIntent } from 'api/functions/app/home';
import { useAppSelector } from 'types/reduxTypes';
import { usePaymentSheet, useStripe } from '@stripe/stripe-react-native';
import { logger } from 'utils/logger';

const QUICK_TIPS = [5, 10, 20, 50];
const TIP_LIMIT_MAX = 500;

export const TipDentor = ({ route }: AppScreenProps<typeof SCREENS.TIP_DENTOR>) => {
  const bookingId = route?.params?.bookingId;
  const userToTip = route?.params?.userToTip;
  const booking = route?.params?.booking;
  const currentUserId = useAppSelector(state => state?.user?.userDetails?.id);

  const displayUser = getDentorFromBooking(booking ?? null, currentUserId) ?? userToTip;
  const displayName =
    displayUser?.full_name ??
    [displayUser?.first_name, displayUser?.last_name].filter(Boolean).join(' ') ??
    'Service Provider';

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [limitModal, setLimitModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { retrieveSetupIntent } = useStripe();

  const amount = selectedAmount ?? (customAmount ? parseFloat(customAmount) || 0 : 0);
  const isValid = amount > 0;

  const handleSubmit = async () => {
    if (!bookingId || !isValid) return;

    if (amount > TIP_LIMIT_MAX) {
      setLimitModal({
        visible: true,
        message: `Tip amount cannot exceed $${TIP_LIMIT_MAX}. Please enter a lower amount.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const setupRes = await getSetupIntent();
      if (!setupRes?.setup_intent) {
        showToast({ message: 'Unable to initialize payment. Please try again.', isError: true });
        return;
      }
      const { error: setupInitError } = await initPaymentSheet({
        setupIntentClientSecret: setupRes.setup_intent,
        merchantDisplayName: 'Sn Lift',
        customerId: setupRes.customer,
        customerEphemeralKeySecret: setupRes.ephemeralKey,
      });
      if (setupInitError) {
        showToast({ message: setupInitError.message ?? 'Payment setup failed', isError: true });
        return;
      }
      const { error: setupPresentError } = await presentPaymentSheet();
      if (setupPresentError) {
        if (setupPresentError.code !== 'Canceled') {
          showToast({ message: setupPresentError.message ?? 'Card setup failed', isError: true });
        }
        return;
      }
      const setupIntentResult = await retrieveSetupIntent(setupRes.setup_intent);
      const paymentMethodId =
        setupIntentResult?.setupIntent?.paymentMethodId ??
        setupIntentResult?.setupIntent?.paymentMethod?.id;
      if (!paymentMethodId) {
        showToast({
          message: 'Could not retrieve payment method. Please try again.',
          isError: true,
        });
        return;
      }
      const res = await giveTipToDentor({
        booking_id: bookingId,
        payment_method_id: paymentMethodId,
        amount,
      });
      if (res) {
        showToast({ message: 'Tip sent successfully!', isError: false });
        onBack();
      }
    } catch (e) {
      logger.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper useScrollView headerTitle='Give Tip'>
      <View style={styles.container}>
        <Photo
          source={displayUser?.profile_image ?? IMAGES.USER}
          resizeMode='contain'
          imageStyle={styles.userImage}
        />
        <Typography style={styles.name}>{displayName}</Typography>
        <Typography style={styles.subtitle}>Show your appreciation for a job well done</Typography>

        <View style={styles.quickTips}>
          <Typography style={styles.sectionLabel}>Quick tip</Typography>
          <RowComponent style={styles.tipRow}>
            {QUICK_TIPS.map(t => (
              <TouchableOpacity
                key={String(t)}
                style={[
                  styles.tipChip,
                  selectedAmount === t && !customAmount && styles.tipChipSelected,
                ]}
                onPress={() => {
                  setSelectedAmount(t);
                  setCustomAmount('');
                }}
              >
                <Typography
                  style={[
                    styles.tipChipText,
                    selectedAmount === t && !customAmount && styles.tipChipTextSelected,
                  ]}
                >
                  {`$${t}`}
                </Typography>
              </TouchableOpacity>
            ))}
          </RowComponent>
        </View>

        <View style={styles.customSection}>
          <Typography style={styles.sectionLabel}>Custom amount ($)</Typography>
          <Input
            value={customAmount}
            onChangeText={t => {
              setCustomAmount(t.replace(/[^0-9.]/g, ''));
              if (t) setSelectedAmount(null);
            }}
            placeholder='0.00'
            name={COMMON_TEXT.REMARKS}
            lineAfterIcon={false}
            keyboardType='decimal-pad'
            inputContainerWithTitleStyle={{ width: '100%' }}
          />
        </View>

        <Button
          title='Send Tip'
          loading={submitting}
          disabled={!bookingId || !isValid}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
      <ValidationErrorModal
        visible={limitModal.visible}
        onClose={() => setLimitModal(prev => ({ ...prev, visible: false }))}
        title='Tip Limit Exceeded'
        message={limitModal.message}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.GAP_15,
    ...FLEX_CENTER,
    marginTop: 10,
    ...STYLES.CONTAINER,
  },
  userImage: {
    borderWidth: 0.5,
    borderColor: COLORS.LIGHT_GREY,
    width: 100,
    height: 100,
    backgroundColor: COLORS.WHITE,
    borderRadius: 100,
  },
  name: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
  },
  subtitle: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    marginBottom: 8,
  },
  quickTips: {
    width: '100%',
    marginTop: 20,
  },
  tipRow: {
    flexWrap: 'wrap',
    gap: 8,
  },
  tipChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
  },
  tipChipSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY,
  },
  tipChipText: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.TEXT,
  },
  tipChipTextSelected: {
    color: COLORS.WHITE,
  },
  customSection: {
    width: '100%',
    marginTop: 20,
  },
  submitButton: {
    marginVertical: 25,
    marginHorizontal: 20,
  },
});
