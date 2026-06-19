import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import {
  AppGradient,
  BookingRatingStars,
  Button,
  Icon,
  Typography,
  WorkerRouteAddresses,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { onBack, pushRootScreen } from 'navigation/Navigators';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaBookingById } from 'constants/alphaBookingMocks';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import { getBookingStatusLabel, resolveFoodOrderLines, resolveFoodOrderSummary } from 'api/mappers/snliftBooking';
import { FoodOrderSummaryCard } from 'components/common/food/FoodOrderSummary';
import type { SnliftBooking } from 'types/snliftApi';
import { COLORS, formatMoney, formatDistanceKm } from 'utils/index';
import {
  buildConsumerBookingTrackTarget,
  canCancelConsumerBooking,
  getConsumerTrackButtonLabel,
} from 'utils/consumerBookingNavigation';
import { BOOKING_STATUS } from 'utils/bookingStatuses';
import { isTerminalBookingStatus } from 'utils/bookingTrackPhases';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { useBookingRating } from 'hooks/useBookingRating';
import { CancelReasonModal } from './CancelReasonModal';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: COLORS.APP_PRIMARY,
  arrived: COLORS.APP_PRIMARY,
  preparing: COLORS.APP_PRIMARY,
  ready_for_pickup: COLORS.APP_SECONDARY,
  picked_up: COLORS.APP_SECONDARY,
  in_transit: COLORS.APP_SECONDARY,
  completed: '#16A34A',
  cancelled: COLORS.RED,
};

function serviceLabel(type: SnliftBooking['booking_type']): string {
  if (type === 'food') return 'Food Delivery';
  if (type === 'parcel') return 'Parcel';
  return 'Ride';
}

function formatDateTime(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export const ConsumerBookingDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.CONSUMER_BOOKING_DETAIL>>();
  const bookingId = route.params?.bookingId;
  const [booking, setBooking] = useState<SnliftBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelVisible, setCancelVisible] = useState(false);

  const {
    rating,
    setRating,
    hasRated,
    submitting: ratingSubmitting,
    submit: submitRating,
    reload: reloadRating,
  } = useBookingRating(bookingId, booking?.booking_type);

  const loadBooking = useCallback(async () => {
    if (bookingId == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setBooking(getAlphaBookingById(bookingId) ?? null);
      setLoading(false);
      return;
    }
    const res = await getBookingById(bookingId, 'user');
    setBooking(extractBookingFromResponse(res));
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useFocusEffect(
    useCallback(() => {
      void loadBooking();
      void reloadRating();
    }, [loadBooking, reloadRating]),
  );

  const statusKey = (booking?.status ?? 'pending').toLowerCase();
  const statusColor = STATUS_COLORS[statusKey] ?? COLORS.APP_PRIMARY;
  const trackTarget = booking ? buildConsumerBookingTrackTarget(booking) : null;
  const showCancel = canCancelConsumerBooking(booking?.status, booking?.booking_type);
  const isTerminal = isTerminalBookingStatus(booking?.status);
  const isCompleted = statusKey === BOOKING_STATUS.COMPLETED;
  const isCancelled = statusKey === BOOKING_STATUS.CANCELLED;
  const trackButtonLabel = booking ? getConsumerTrackButtonLabel(booking) : null;

  const foodOrderLines = useMemo(
    () => (booking?.booking_type === 'food' ? resolveFoodOrderLines(booking) : []),
    [booking],
  );

  const foodOrderSummary = useMemo(
    () => (booking?.booking_type === 'food' ? resolveFoodOrderSummary(booking) : null),
    [booking],
  );

  const showParcelContacts =
    booking?.booking_type === 'parcel' &&
    Boolean(
      booking.sender_name ||
        booking.sender_phone ||
        booking.receiver_name ||
        booking.receiver_phone ||
        booking.item_description,
    );

  const handleTrack = () => {
    if (!trackTarget) return;
    pushRootScreen(
      trackTarget.screen as keyof RootStackParamList,
      trackTarget.params as RootStackParamList[keyof RootStackParamList],
    );
  };

  const handleSubmitRating = async () => {
    const ok = await submitRating();
    if (ok) await loadBooking();
  };

  return (
    <Wrapper
      headerTitle='Booking Details'
      showBackButton
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size='large' color={COLORS.APP_PRIMARY} />
        </View>
      ) : !booking ? (
        <Typography style={styles.empty}>Could not load booking details.</Typography>
      ) : (
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <AppGradient variant='primary' style={styles.typeIcon}>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName={
                  booking.booking_type === 'food'
                    ? 'restaurant-outline'
                    : booking.booking_type === 'parcel'
                      ? 'cube-outline'
                      : 'car-sport-outline'
                }
                size={24}
                color={COLORS.WHITE}
              />
            </AppGradient>
            <View style={styles.headerMeta}>
              <Typography style={styles.serviceType}>
                {serviceLabel(booking.booking_type)}
              </Typography>
              <Typography style={styles.dateLine}>
                {formatDateTime(booking.created_at)}
              </Typography>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Typography style={[styles.statusText, { color: statusColor }]}>
                {getBookingStatusLabel(booking.status)}
              </Typography>
            </View>
          </View>

          {booking.booking_type !== 'food' ? (
            <View style={styles.priceCard}>
              <Typography style={styles.priceLabel}>Total</Typography>
              <Typography style={styles.priceValue}>
                {formatMoney(booking.total_amount ?? booking.estimated_amount ?? booking.fare)}
              </Typography>
              {booking.distance_km != null ? (
                <Typography style={styles.distance}>
                  {formatDistanceKm(booking.distance_km)}
                </Typography>
              ) : null}
            </View>
          ) : null}

          <WorkerRouteAddresses
            pickupAddress={booking.pickup_address ?? booking.restaurant?.name ?? 'Pickup'}
            dropoffAddress={booking.dropoff_address ?? booking.delivery_address ?? 'Drop-off'}
          />

          {showParcelContacts ? (
            <View style={styles.infoCard}>
              <Typography style={styles.sectionTitle}>Parcel details</Typography>
              {booking.item_description ? (
                <Typography style={styles.infoLine}>
                  {`Package: ${booking.item_description}`}
                </Typography>
              ) : null}
              {booking.sender_name || booking.sender_phone ? (
                <View style={styles.contactBlock}>
                  <Typography style={styles.contactRole}>Sender</Typography>
                  <Typography style={styles.contactName}>{booking.sender_name ?? '—'}</Typography>
                  {booking.sender_phone ? (
                    <Typography style={styles.contactMeta}>{booking.sender_phone}</Typography>
                  ) : null}
                </View>
              ) : null}
              {booking.receiver_name || booking.receiver_phone ? (
                <View style={styles.contactBlock}>
                  <Typography style={styles.contactRole}>Recipient</Typography>
                  <Typography style={styles.contactName}>
                    {booking.receiver_name ?? '—'}
                  </Typography>
                  {booking.receiver_phone ? (
                    <Typography style={styles.contactMeta}>{booking.receiver_phone}</Typography>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {foodOrderLines.length > 0 ? (
            <View style={styles.infoCard}>
              <Typography style={styles.sectionTitle}>Ordered items</Typography>
              {booking.restaurant?.name ? (
                <Typography style={styles.restaurantName}>{booking.restaurant.name}</Typography>
              ) : null}
              {foodOrderLines.map(line => (
                <View key={line.key} style={styles.orderRow}>
                  <View style={styles.orderMeta}>
                    <Typography style={styles.orderName}>{line.label}</Typography>
                    <Typography style={styles.orderQty}>
                      {line.unitPrice
                        ? `${line.unitPrice} × ${line.quantity}`
                        : `Qty: ${line.quantity}`}
                    </Typography>
                  </View>
                  {line.lineTotal ? (
                    <Typography style={styles.orderPrice}>{line.lineTotal}</Typography>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {foodOrderSummary ? <FoodOrderSummaryCard summary={foodOrderSummary} /> : null}

          {booking.provider?.full_name ? (
            <View style={styles.providerCard}>
              <Typography style={styles.sectionTitle}>Provider</Typography>
              <Typography style={styles.providerName}>{booking.provider.full_name}</Typography>
              {booking.provider.vehicle_model ? (
                <Typography style={styles.providerMeta}>
                  {[booking.provider.vehicle_color, booking.provider.vehicle_model]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              ) : null}
            </View>
          ) : null}

          {booking.cancellation_reason ? (
            <View style={styles.noteCard}>
              <Typography style={styles.sectionTitle}>Cancellation reason</Typography>
              <Typography style={styles.noteText}>{booking.cancellation_reason}</Typography>
            </View>
          ) : null}

          {isCompleted ? (
            <View style={styles.ratingCard}>
              <BookingRatingStars
                title={hasRated ? 'Your rating' : 'Rate your experience'}
                subtitle={
                  hasRated ? 'Thanks for your feedback' : 'How was your booking?'
                }
                value={rating}
                onChange={hasRated ? undefined : setRating}
                readonly={hasRated}
                size={42}
              />
              {!hasRated ? (
                <Button
                  title={ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  disabled={ratingSubmitting}
                  onPress={() => void handleSubmitRating()}
                  style={styles.primaryBtn}
                />
              ) : null}
            </View>
          ) : null}

          {!isTerminal && trackTarget && trackButtonLabel ? (
            <Button title={trackButtonLabel} onPress={handleTrack} style={styles.primaryBtn} />
          ) : null}

          {showCancel ? (
            <Pressable onPress={() => setCancelVisible(true)} style={styles.cancelBtn}>
              <Typography style={styles.cancelTxt}>Cancel Booking</Typography>
            </Pressable>
          ) : null}

          {isCancelled ? (
            <Typography style={styles.terminalNote}>This booking was cancelled.</Typography>
          ) : null}
        </View>
      )}

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={async reason => {
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) onBack();
          return ok;
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 40,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    gap: 4,
  },
  serviceType: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  dateLine: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
  priceCard: {
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  priceLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  priceValue: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginTop: 4,
  },
  distance: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 10,
  },
  infoLine: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT,
  },
  contactBlock: {
    gap: 2,
  },
  contactRole: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
  },
  contactName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  contactMeta: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  restaurantName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
  },
  orderMeta: {
    flex: 1,
    gap: 2,
  },
  orderName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  orderQty: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  orderPrice: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  providerCard: {
    backgroundColor: '#F5F9FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 4,
  },
  sectionTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
  },
  providerName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  providerMeta: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  noteCard: {
    backgroundColor: COLORS.APP_DANGER_BG,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  noteText: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT,
  },
  ratingCard: {
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 12,
  },
  primaryBtn: {
    marginTop: 4,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelTxt: {
    color: COLORS.RED,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  terminalNote: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
    marginTop: 8,
  },
});
