import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppGradient,
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
import { resetToHomeAndScreen } from 'navigation/index';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { formatMoney } from 'utils/currency';
import { SCREENS } from 'constants/routes';
import { createFoodBooking } from 'api/functions/snlift/bookings';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import { showToast } from 'utils/toast';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import {
  clearCart,
  decrementItem,
  removeItem,
  upsertItem,
} from 'store/slices/foodCart';

export const FoodDeliveryCartScreen = () => {
  const [promo, setPromo] = useState('');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const dispatch = useAppDispatch();
  const { restaurantId, restaurantName, items, deliveryFee } = useAppSelector(
    s => s.foodCart,
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (placing) return;
    if (items.length === 0) {
      showToast({ message: 'Add at least one item to your cart.' });
      return;
    }
    setPlacing(true);
    try {
      const promoTrimmed = promo.trim();
      const res = await createFoodBooking({
        booking_type: 'food',
        restaurant_id: Number(restaurantId) || 1,
        delivery_address: 'Delivery address',
        delivery_latitude: 0,
        delivery_longitude: 0,
        distance_km: 4.2,
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
          <Pressable style={styles.apply}>
            <Typography style={styles.applyTxt}>Apply</Typography>
          </Pressable>
        </View>

        <Typography style={styles.section}>Order Summary</Typography>
        <View style={styles.summary}>
          <Row label='Subtotal' value={formatMoney(subtotal)} />
          <Row label='Delivery Fee' value={formatMoney(deliveryFee)} />
          <RowComponent style={styles.totalRow}>
            <Typography style={styles.totalLabel}>Total</Typography>
            <Typography style={styles.total}>{formatMoney(total)}</Typography>
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
          style={[styles.placeWrap, (placing || items.length === 0) && { opacity: 0.6 }]}
          disabled={placing || items.length === 0}
        >
          <AppGradient variant='primary' fill style={styles.placeGradient}>
            <Typography style={styles.placeTxt}>
              {placing ? 'Placing Order...' : `Place Order · ${formatMoney(total)}`}
            </Typography>
          </AppGradient>
        </Pressable>
      </ScrollView>
    </Wrapper>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.rowBetween}>
    <Typography style={styles.muted}>{label}</Typography>
    <Typography style={styles.rowVal}>{value}</Typography>
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
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  apply: {
    backgroundColor: COLORS.APP_SECONDARY,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 50,
  },
  applyTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
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
