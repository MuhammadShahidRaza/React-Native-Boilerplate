import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  AppGradient,
  Button,
  Icon,
  Input,
  Photo,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { navigate, resetToHomeAndScreen } from 'navigation/index';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { extractEstimateDistanceKm } from 'utils/distance';
import { formatMoney } from 'utils/currency';
import { SCREENS } from 'constants/routes';
import {
  createFoodBooking,
  estimateBooking,
  resolveFoodEstimateTotals,
  type EstimateBookingResult,
} from 'api/functions/snlift/bookings';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import { showToast } from 'utils/toast';
import { logger } from 'utils/logger';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { useAddressList } from 'hooks/useAddressList';
import type { Address } from 'types/responseTypes';
import {
  clearCart,
  decrementItem,
  removeItem,
  upsertItem,
} from 'store/slices/foodCart';

const DEFAULT_DISTANCE_KM = 4.2;

const formatEstimateAmount = (value: number | null | undefined, loading: boolean): string => {
  if (loading) return '...';
  if (value == null) return '—';
  return formatMoney(value);
};

const formatDeliveryAddress = (addr: Address): string =>
  addr.full_address?.trim() ||
  [addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ') ||
  addr.street?.trim() ||
  '';

const parseAddressCoord = (raw: string): number | null => {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};

export const FoodDeliveryCartScreen = () => {
  const [promo, setPromo] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [foodEstimate, setFoodEstimate] = useState<EstimateBookingResult | null>(null);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const dispatch = useAppDispatch();
  const { restaurantId, restaurantName, restaurantDistanceKm, items } = useAppSelector(
    s => s.foodCart,
  );
  const { addressList, loadingAddresses, selectedId, refetch } = useAddressList();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const deliveryAddress = useMemo(() => {
    if (!selectedId) return null;
    const addr = addressList.find(a => a.id === selectedId);
    if (!addr) return null;
    const lat = parseAddressCoord(addr.latitude);
    const lng = parseAddressCoord(addr.longitude);
    const label = formatDeliveryAddress(addr);
    if (!label || lat == null || lng == null) return null;
    return { label, lat, lng };
  }, [addressList, selectedId]);

  const estimateRequestDistanceKm =
    restaurantDistanceKm != null && Number.isFinite(restaurantDistanceKm)
      ? restaurantDistanceKm
      : DEFAULT_DISTANCE_KM;

  const resolveDistanceKm = useCallback(() => {
    const fromEstimate = extractEstimateDistanceKm(foodEstimate);
    if (fromEstimate != null) return fromEstimate;
    return estimateRequestDistanceKm;
  }, [estimateRequestDistanceKm, foodEstimate]);

  const localSubtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );

  const totals = useMemo(
    () =>
      resolveFoodEstimateTotals(foodEstimate, {
        subTotal: localSubtotal,
        deliveryFee: 0,
      }),
    [foodEstimate, localSubtotal],
  );

  const hasEstimate = foodEstimate != null;
  const summaryDeliveryFee = hasEstimate ? totals.deliveryFee : null;
  const summaryTotal = hasEstimate ? totals.totalAmount : null;

  const buildFoodEstimatePayload = useCallback(
    (promoCode?: string) => ({
      booking_type: 'food' as const,
      restaurant_id: Number(restaurantId) || 1,
      delivery_latitude: deliveryAddress?.lat ?? 0,
      delivery_longitude: deliveryAddress?.lng ?? 0,
      distance_km: estimateRequestDistanceKm,
      items: items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.qty })),
      ...(promoCode ? { promo_code: promoCode } : {}),
    }),
    [deliveryAddress?.lat, deliveryAddress?.lng, estimateRequestDistanceKm, items, restaurantId],
  );

  const fetchFoodEstimate = useCallback(
    async (promoCode?: string) => {
      if (items.length === 0 || !deliveryAddress || !restaurantId) return null;

      setEstimateLoading(true);
      try {
        const result = await estimateBooking(buildFoodEstimatePayload(promoCode));
        setFoodEstimate(result ?? null);
        return result ?? null;
      } catch (error) {
        logger.error('food estimateBooking failed', error);
        setFoodEstimate(null);
        return null;
      } finally {
        setEstimateLoading(false);
      }
    },
    [buildFoodEstimatePayload, deliveryAddress, items.length, restaurantId],
  );

  useEffect(() => {
    setFoodEstimate(null);
  }, [items, restaurantId, deliveryAddress?.lat, deliveryAddress?.lng]);

  useEffect(() => {
    if (items.length === 0 || !deliveryAddress || !restaurantId) return;
    void fetchFoodEstimate();
  }, [
    deliveryAddress?.lat,
    deliveryAddress?.lng,
    fetchFoodEstimate,
    items.length,
    restaurantId,
  ]);

  const handleApplyPromo = async () => {
    const promoTrimmed = promo.trim();
    if (!promoTrimmed) {
      showToast({ message: 'Enter a promo code.' });
      return;
    }
    if (items.length === 0) {
      showToast({ message: 'Add items before applying a promo.' });
      return;
    }

    setPromoLoading(true);
    try {
      const result = await fetchFoodEstimate(promoTrimmed);
      if (!result) {
        showToast({ message: 'Could not validate promo. Try again.', isError: true });
        return;
      }

      if (result.promo_valid === false) {
        setFoodEstimate(null);
        showToast({ message: 'Invalid promo code.', isError: true });
        return;
      }

      const applied = resolveFoodEstimateTotals(result, {
        subTotal: localSubtotal,
        deliveryFee: 0,
      });

      if (applied.promoApplied || applied.discountAmount > 0) {
        showToast({ message: 'Promo applied successfully.' });
        return;
      }

      showToast({ message: 'Promo code is not applicable to this order.', isError: true });
    } catch (error) {
      logger.error('food estimateBooking failed', error);
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (placing) return;
    if (items.length === 0) {
      showToast({ message: 'Add at least one item to your cart.' });
      return;
    }
    if (!deliveryAddress) {
      showToast({ message: 'Please add a delivery address first.', isError: true });
      navigate(SCREENS.LOCATION);
      return;
    }
    if (!hasEstimate) {
      showToast({ message: 'Calculating delivery fee. Please wait.', isError: true });
      return;
    }
    setPlacing(true);
    try {
      const promoTrimmed = promo.trim();
      const res = await createFoodBooking({
        booking_type: 'food',
        restaurant_id: Number(restaurantId) || 1,
        delivery_address: deliveryAddress.label,
        delivery_latitude: deliveryAddress.lat,
        delivery_longitude: deliveryAddress.lng,
        distance_km: resolveDistanceKm(),
        items: items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.qty })),
        ...(promoTrimmed ? { promo_code: promoTrimmed } : {}),
      });
      const booking = res && 'booking' in res ? res.booking : res;
      if (!booking?.id) {
        showToast({ message: 'Could not place food order. Try again.' });
        return;
      }
      dispatch(clearCart());
      const timerDurationSeconds = await getJobDisplayTimerSeconds();
      const timerAnchorAt = new Date().toISOString();
      resetToHomeAndScreen(SCREENS.TRACK_FOOD_ORDER, {
        bookingId: booking.id,
        timerAnchorAt,
        timerDurationSeconds,
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Wrapper
      headerTitle={`Cart · ${restaurantName || 'Restaurant'}`}
      showBackButton
      useScrollView={false}
      darkMode={false}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Typography style={styles.section}>{restaurantName || 'Restaurant'}</Typography>

        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon
              componentName={VARIABLES.Feather}
              iconName='shopping-cart'
              size={40}
              color={COLORS.APP_TEXT_MUTED}
            />
            <Typography style={styles.emptyTxt}>Your cart is empty</Typography>
          </View>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <Photo
                source={item.imageUri ? { uri: item.imageUri } : IMAGES.RESTAURANT_ITEM_2}
                size={80}
                borderRadius={10}
                imageStyle={styles.thumb}
              />
              <View style={{ flex: 1 }}>
                <Typography style={styles.itemName} numberOfLines={2}>
                  {item.title}
                </Typography>
                <Typography style={styles.itemPrice}>
                  {formatMoney(item.price)}
                </Typography>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => dispatch(decrementItem(item.id))}
                  >
                    <Typography style={styles.qtyTxt}>-</Typography>
                  </Pressable>
                  <Typography style={styles.qtyVal}>
                    {String(item.qty).padStart(2, '0')}
                  </Typography>
                  <Pressable
                    style={[styles.qtyBtn, styles.qtyBtnPlus]}
                    onPress={() =>
                      dispatch(
                        upsertItem({
                          id: item.id,
                          menuItemId: item.menuItemId,
                          title: item.title,
                          price: item.price,
                          imageUri: item.imageUri,
                        }),
                      )
                    }
                  >
                    <Typography style={[styles.qtyTxt, { color: COLORS.WHITE }]}>+</Typography>
                  </Pressable>
                </View>
              </View>
              <Pressable style={styles.trash} onPress={() => dispatch(removeItem(item.id))}>
                <Icon
                  componentName={VARIABLES.Feather}
                  iconName='trash-2'
                  size={FontSize.Small}
                  color={COLORS.APP_DANGER_TEXT}
                />
              </Pressable>
            </View>
          ))
        )}

        <Typography style={styles.section}>Delivery Address</Typography>
        {loadingAddresses ? (
          <View style={styles.addressLoading}>
            <ActivityIndicator color={COLORS.APP_PRIMARY} />
          </View>
        ) : deliveryAddress ? (
          <Pressable style={styles.deliveryCard} onPress={() => navigate(SCREENS.LOCATION)}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={FontSize.Large}
              color={COLORS.APP_PRIMARY}
            />
            <View style={styles.deliveryInfo}>
              <Typography style={styles.deliveryLabel} numberOfLines={2}>
                {deliveryAddress.label}
              </Typography>
              <Typography style={styles.deliveryChange}>Change address</Typography>
            </View>
            <Icon
              componentName={VARIABLES.Feather}
              iconName='chevron-right'
              size={FontSize.Medium}
              color={COLORS.APP_TEXT_MUTED}
            />
          </Pressable>
        ) : (
          <Pressable style={styles.addAddressCard} onPress={() => navigate(SCREENS.LOCATION)}>
            <Icon
              componentName={VARIABLES.MaterialIcons}
              iconName='add-location'
              size={FontSize.Large}
              color={COLORS.APP_PRIMARY}
            />
            <View style={styles.deliveryInfo}>
              <Typography style={styles.addAddressTitle}>Add Delivery Address</Typography>
              <Typography style={styles.addAddressSub}>
                Save your address to place a food order
              </Typography>
            </View>
          </Pressable>
        )}

        <Typography style={styles.section}>Promo Code</Typography>
        <View style={styles.promoRow}>
          <Input
            value={promo}
            onChangeText={setPromo}
            name='promo'
            placeholder='Enter Promo Code'
            secondContainerStyle={{
              marginBottom: 0,
              width: screenWidth(70),
            }}
          />
          <Button
            title='Apply'
            style={styles.applyBtn}
            loading={promoLoading}
            onPress={handleApplyPromo}
          />
        </View>

        <Typography style={styles.section}>Order Summary</Typography>
        <View style={styles.summary}>
          <Row label='Subtotal' value={formatMoney(totals.subTotal)} />
          <Row
            label='Delivery Fee'
            value={formatEstimateAmount(summaryDeliveryFee, estimateLoading)}
          />
          {totals.discountAmount > 0 ? (
            <Row label='Discount' value={formatMoney(-totals.discountAmount)} valueStyle={styles.discountVal} />
          ) : null}
          <RowComponent style={styles.totalRow}>
            <Typography style={styles.totalLabel}>Total</Typography>
            <Typography style={styles.total}>
              {formatEstimateAmount(summaryTotal, estimateLoading)}
            </Typography>
          </RowComponent>
          <View style={styles.payBadge}>
            <Icon
              componentName={VARIABLES.Feather}
              iconName='dollar-sign'
              size={FontSize.Small}
              color={COLORS.APP_PRIMARY}
            />
            <Typography style={styles.payTxt}>Payment: Cash On Delivery</Typography>
          </View>
        </View>

        <Typography style={styles.section}>Delivery Note (Optional)</Typography>
        <Input
          value={note}
          onChangeText={text => setNote(text)}
          name='note'
          secondContainerStyle={{ height: screenHeight(20), borderRadius: 15 }}
          placeholder='Any Special Instructions...'
          style={styles.note}
          multiline={true}
          maxLines={5}
        />

        <Pressable
          onPress={handlePlaceOrder}
          style={[
            styles.placeWrap,
            (placing || items.length === 0 || !deliveryAddress || estimateLoading || !hasEstimate) && {
              opacity: 0.6,
            },
          ]}
          disabled={placing || items.length === 0 || !deliveryAddress || estimateLoading || !hasEstimate}
        >
          <AppGradient variant='primary' fill style={styles.placeGradient}>
            <Typography style={styles.placeTxt}>
              {placing
                ? 'Placing Order...'
                : estimateLoading
                  ? 'Calculating total...'
                  : `Place Order · ${formatEstimateAmount(summaryTotal, false)}`}
            </Typography>
          </AppGradient>
        </Pressable>
      </ScrollView>
    </Wrapper>
  );
};

const Row = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) => (
  <View style={styles.rowBetween}>
    <Typography style={styles.muted}>{label}</Typography>
    <Typography style={[styles.rowVal, valueStyle]}>{value}</Typography>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    marginBottom: 10,
    marginTop: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
  },
  itemCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemName: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.MediumSmall,
  },
  itemPrice: {
    marginTop: 4,
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: COLORS.APP_PRIMARY_DARK,
  },
  qtyTxt: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY_DARK,
  },
  qtyVal: {
    fontWeight: FontWeight.Bold,
    minWidth: 24,
    textAlign: 'center',
  },
  trash: {
    padding: 8,
    backgroundColor: COLORS.APP_DANGER_BG,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addressLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.APP_PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
    backgroundColor: '#F0FDF4',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.MediumSmall,
  },
  deliveryChange: {
    marginTop: 4,
    color: COLORS.APP_PRIMARY,
    fontSize: FontSize.Small,
  },
  addAddressTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.MediumSmall,
  },
  addAddressSub: {
    marginTop: 4,
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  applyBtn: {
    minWidth: screenWidth(22),
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 50,
  },
  discountVal: {
    color: COLORS.APP_PRIMARY,
  },
  summary: {
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 14,
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  muted: {
    color: COLORS.APP_TEXT_MUTED,
  },
  rowVal: {
    color: COLORS.APP_TEXT,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
    paddingTop: 10,
  },
  totalLabel: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
    marginTop: 8,
  },
  total: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
    color: COLORS.APP_PRIMARY,
    marginTop: 8,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: 12,
    width: '70%',
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    borderRadius: 999,
  },
  payTxt: {
    color: COLORS.APP_PRIMARY_DARK,
    fontSize: FontSize.Small,
  },
  note: {
    height: screenHeight(20),
    padding: 12,
    textAlignVertical: 'top',
    color: COLORS.APP_TEXT,
  },
  placeWrap: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  placeGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
});
