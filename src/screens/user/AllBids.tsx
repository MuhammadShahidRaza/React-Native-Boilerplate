import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { usePaymentSheet, useStripe } from '@stripe/stripe-react-native';
import {
  RowComponent,
  Typography,
  Button,
  FlatListComponent,
  Wrapper,
  Icon,
} from 'components/index';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, STYLES, screenWidth, showToast } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { navigate, replace } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { AppScreenProps } from 'types/navigation';
import { getQuotationsByBookingId } from 'api/functions/app/quotations';
import {
  getQuotationPaymentIntent,
  acceptRejectQuotation,
  getSetupIntent,
} from 'api/functions/app/home';
import type { Quotation } from 'types/responseTypes';
import NoItemFound from 'components/common/NoItemFound';

const AllBidsSkeleton = () => (
  <View style={skeletonStyles.listContent}>
    {[1, 2, 3].map(i => (
      <View key={i} style={skeletonStyles.bidCard}>
        <View style={skeletonStyles.bidRowSkeleton}>
          <SkeletonPlaceholder
            borderRadius={8}
            backgroundColor={COLORS.SKELETON_BACKGROUND}
            highlightColor={COLORS.SKELETON_HIGHLIGHT}
          >
            <SkeletonPlaceholder.Item width={screenWidth(35)} height={18} borderRadius={6} />
          </SkeletonPlaceholder>
          <SkeletonPlaceholder
            borderRadius={8}
            backgroundColor={COLORS.SKELETON_BACKGROUND}
            highlightColor={COLORS.SKELETON_HIGHLIGHT}
          >
            <SkeletonPlaceholder.Item width={screenWidth(25)} height={24} borderRadius={6} />
          </SkeletonPlaceholder>
        </View>
        <View style={skeletonStyles.actionButtonsContainer}>
          <SkeletonPlaceholder
            borderRadius={20}
            backgroundColor={COLORS.SKELETON_BACKGROUND}
            highlightColor={COLORS.SKELETON_HIGHLIGHT}
          >
            <SkeletonPlaceholder.Item width={90} height={36} borderRadius={20} marginRight={10} />
          </SkeletonPlaceholder>
          <SkeletonPlaceholder
            borderRadius={20}
            backgroundColor={COLORS.SKELETON_BACKGROUND}
            highlightColor={COLORS.SKELETON_HIGHLIGHT}
          >
            <SkeletonPlaceholder.Item width={90} height={36} borderRadius={20} />
          </SkeletonPlaceholder>
        </View>
      </View>
    ))}
  </View>
);

export const AllBids = ({ route }: AppScreenProps<typeof SCREENS.ALL_BIDS>) => {
  const jobId = route?.params?.data?.jobId;
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    id: number;
    action: 'accept' | 'decline';
  } | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { retrieveSetupIntent, confirmPayment: _confirmPayment } = useStripe();

  const fetchQuotations = useCallback(
    async (isRefresh = false) => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await getQuotationsByBookingId(jobId);
        setQuotations(res?.quotation ?? []);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAccept = async (item: Quotation) => {
    if (!jobId) return;
    setActionLoading({ id: item.id, action: 'accept' });
    try {
      // Step 1: Create SetupIntent (save card) - POST payment/create-setup-intent
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
      // Step 2: Get payment_method_id from confirmed SetupIntent
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

      // Step 3: Confirm payment with PaymentIntent (no second sheet - user already added card)
      const response = await getQuotationPaymentIntent({
        booking_id: jobId,
        quotation_id: item.id,
        payment_method_id: paymentMethodId,
      });
      if (response) {
        // Backend auto-accepts quotation on successful payment
        showToast({ message: 'Bid accepted successfully!', isError: false });
        replace(SCREENS.BOTTOM_STACK);
      }
    } catch (e) {
      showToast({ message: 'Something went wrong. Please try again.', isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (quotationId: number) => {
    setActionLoading({ id: quotationId, action: 'decline' });
    try {
      const res = await acceptRejectQuotation({ quotation_id: quotationId, status: 'rejected' });
      if (res) {
        setQuotations(prev => prev.filter(q => q.id !== quotationId));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewReviews = (userId: number) => {
    navigate(SCREENS.REVIEWS, { userId });
  };

  const renderBidCard = useCallback(
    ({ item }: { item: Quotation }) => {
      const isAcceptLoading = actionLoading?.id === item.id && actionLoading?.action === 'accept';
      const isDeclineLoading = actionLoading?.id === item.id && actionLoading?.action === 'decline';
      const dropOffAddress = item?.drop_off_address ?? 'No drop off address';
      const userName = item?.user?.full_name ?? 'Unknown User';
      const amount = parseFloat(String(item?.amount ?? 0));

      return (
        <View style={styles.bidCard}>
          <RowComponent style={styles.bidRow}>
            <Typography
              fontSize={FontSize.Medium}
              fontWeight={FontWeight.Medium}
              style={styles.providerName}
            >
              {userName}
            </Typography>
            <Typography
              fontSize={FontSize.ExtraLarge}
              fontWeight={FontWeight.Bold}
              style={styles.bidAmount}
            >
              {`$${amount?.toFixed(2)}`}
            </Typography>
          </RowComponent>

          {dropOffAddress ? (
            <View style={styles.dropoffRow}>
              <Icon
                iconName='location'
                componentName={VARIABLES.EvilIcons}
                size={16}
                color={COLORS.TEXT_SECONDARY}
              />
              <Typography numberOfLines={2} ellipsizeMode='middle' style={styles.dropoffText}>
                {dropOffAddress}
              </Typography>
            </View>
          ) : null}

          <RowComponent style={styles.actionButtonsContainer}>
            {/* <RowComponent style={{ gap: 10 }}> */}
            <Button
              title='Accept'
              onPress={() => handleAccept(item)}
              loading={isAcceptLoading}
              disabled={!!actionLoading}
              style={styles.acceptButton}
              textStyle={styles.acceptButtonText}
            />
            <Button
              title='Decline'
              onPress={() => handleDecline(item.id)}
              loading={isDeclineLoading}
              disabled={!!actionLoading}
              loaderColor={COLORS.TEXT}
              style={styles.declineButton}
              textStyle={styles.declineButtonText}
            />
            {/* </RowComponent> */}
          </RowComponent>
          <TouchableOpacity onPress={() => handleViewReviews(item.user_id)}>
            <Typography style={styles.viewReviewsLink}>View Reviews</Typography>
          </TouchableOpacity>
        </View>
      );
    },
    [actionLoading],
  );

  if (loading) {
    return (
      <Wrapper headerTitle='All Bids'>
        <AllBidsSkeleton />
      </Wrapper>
    );
  }

  return (
    <Wrapper headerTitle='All Bids'>
      <FlatListComponent
        data={quotations}
        renderItem={renderBidCard}
        scrollEnabled={true}
        contentContainerStyle={[styles.listContent, quotations.length === 0 && styles.emptyContent]}
        keyExtractor={item => item?.id?.toString()}
        ListEmptyComponent={<NoItemFound message='No bids received yet' />}
        onRefresh={() => fetchQuotations(true)}
        refreshing={refreshing}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
    ...STYLES.CONTAINER,
  },
  emptyContent: {
    flexGrow: 1,
  },
  bidCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  bidRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
  },
  dropoffText: {
    flex: 1,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FontSize.Small,
  },
  providerName: {
    color: COLORS.TEXT,
    flex: 1,
  },
  bidAmount: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.ExtraLarge,
  },
  actionButtonsContainer: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  acceptButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    width: '47%',
    flex: 0,
  },
  acceptButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
  },
  declineButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.TEXT,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    width: '47%',
    flex: 0,
  },
  declineButtonText: {
    color: COLORS.TEXT,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
  },
  viewReviewsLink: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    marginTop: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

const skeletonStyles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
    ...STYLES.CONTAINER,
  },
  bidCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  bidRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
