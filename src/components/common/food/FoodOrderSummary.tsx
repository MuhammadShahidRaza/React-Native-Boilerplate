import { StyleSheet, View } from 'react-native';
import { RowComponent, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { FoodOrderSummary } from 'api/mappers/snliftBooking';
import { formatMoney } from 'utils/currency';
import { COLORS } from 'utils/colors';

type Props = {
  summary: FoodOrderSummary;
  title?: string;
};

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.rowBetween}>
      <Typography style={styles.muted}>{label}</Typography>
      <Typography style={[styles.value, valueStyle]}>{value}</Typography>
    </View>
  );
}

/** Subtotal, delivery fee, discount, and total for a food booking. */
export function FoodOrderSummaryCard({ summary, title = 'Order Summary' }: Props) {
  return (
    <View style={styles.card}>
      <Typography style={styles.title}>{title}</Typography>
      <SummaryRow label='Subtotal' value={formatMoney(summary.subTotal)} />
      <SummaryRow label='Delivery Fee' value={formatMoney(summary.deliveryFee)} />
      {summary.discountAmount > 0 ? (
        <SummaryRow
          label='Discount'
          value={formatMoney(-summary.discountAmount)}
          valueStyle={styles.discountVal}
        />
      ) : null}
      <RowComponent style={styles.totalRow}>
        <Typography style={styles.totalLabel}>Total</Typography>
        <Typography style={styles.totalValue}>{formatMoney(summary.totalAmount)}</Typography>
      </RowComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 10,
  },
  title: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    marginBottom: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  muted: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  value: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  discountVal: {
    color: COLORS.APP_PRIMARY,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  totalValue: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
});
