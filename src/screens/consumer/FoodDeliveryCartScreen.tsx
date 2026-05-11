import { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { onBack } from 'navigation/index';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const FoodDeliveryCartScreen = () => {
  const [qty, setQty] = useState(1);
  const [promo, setPromo] = useState('');

  return (
    <Wrapper
      headerTitle="Cart 1"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView
      darkMode={false}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Typography style={styles.section}>Burger Lab</Typography>
        <View style={styles.itemCard}>
          <Image source={IMAGES.USER} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Typography style={styles.itemName} numberOfLines={1}>
              Double Smash Burger
            </Typography>
            <Typography style={styles.itemPrice}>CFA 330</Typography>
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQty(q => Math.max(1, q - 1))}
              >
                <Typography style={styles.qtyTxt}>-</Typography>
              </Pressable>
              <Typography style={styles.qtyVal}>{String(qty).padStart(2, '0')}</Typography>
              <Pressable style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => setQty(q => q + 1)}>
                <Typography style={[styles.qtyTxt, { color: COLORS.WHITE }]}>+</Typography>
              </Pressable>
            </View>
          </View>
          <Pressable style={styles.trash}>
            <Icon
              componentName={VARIABLES.Feather}
              iconName="trash-2"
              size={FontSize.Small}
              color={COLORS.APP_DANGER_TEXT}
            />
          </Pressable>
        </View>

        <Typography style={styles.section}>Promo Code</Typography>
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter Promo Code"
            placeholderTextColor={COLORS.APP_TEXT_MUTED}
            value={promo}
            onChangeText={setPromo}
          />
          <Pressable style={styles.apply}>
            <Typography style={styles.applyTxt}>Apply</Typography>
          </Pressable>
        </View>

        <Typography style={styles.section}>Order Summary</Typography>
        <View style={styles.summary}>
          <Row label="Subtotal" value="CFA 550" />
          <Row label="Delivery Fee" value="CFA 50" />
          <Typography style={styles.total}>CFA 600</Typography>
          <View style={styles.payBadge}>
            <Icon
              componentName={VARIABLES.Feather}
              iconName="dollar-sign"
              size={FontSize.Small}
              color={COLORS.APP_PRIMARY}
            />
            <Typography style={styles.payTxt}>Payment: Cash On Delivery</Typography>
          </View>
        </View>

        <Typography style={styles.section}>Delivery Note (Optional)</Typography>
        <TextInput
          style={styles.note}
          placeholder="Any Special Instructions..."
          placeholderTextColor={COLORS.APP_TEXT_MUTED}
          multiline
        />

        <Pressable onPress={() => onBack()} style={styles.placeWrap}>
          <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.placeBtn}>
            <Typography style={styles.placeTxt}>Place Order - CFA 600</Typography>
          </LinearGradient>
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
  itemCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  itemName: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  itemPrice: {
    marginTop: 4,
    color: COLORS.APP_TEXT,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
  },
  trash: {
    padding: 8,
    backgroundColor: COLORS.APP_DANGER_BG,
    borderRadius: 20,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.APP_TEXT,
  },
  apply: {
    backgroundColor: COLORS.APP_SECONDARY,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
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
  total: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
    color: COLORS.APP_PRIMARY,
    textAlign: 'right',
    marginTop: 8,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    borderRadius: 999,
  },
  payTxt: {
    color: COLORS.APP_PRIMARY_DARK,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  note: {
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    borderRadius: 12,
    minHeight: 90,
    padding: 12,
    textAlignVertical: 'top',
    color: COLORS.APP_TEXT,
  },
  placeWrap: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  placeBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
});
