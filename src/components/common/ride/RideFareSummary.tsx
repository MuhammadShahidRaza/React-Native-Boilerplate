import { StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import { FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface RideFareSummaryProps {
  fareLabel?: string;
  fareValue: string;
  paymentLabel?: string;
  paymentValue: string;
}

export const RideFareSummary = ({
  fareLabel = 'Estimate Fare',
  fareValue,
  paymentLabel = 'Payment',
  paymentValue,
}: RideFareSummaryProps) => (
  <View style={styles.fareCard}>
    <View style={styles.fareRow}>
      <Typography style={styles.fareLabel}>{fareLabel}</Typography>
      <Typography style={styles.fareValue}>{fareValue}</Typography>
    </View>
    <View style={styles.fareDivider} />
    <View style={styles.fareRow}>
      <Typography style={styles.fareTotalLabel}>{paymentLabel}</Typography>
      <Typography style={styles.fareTotalValue}>{paymentValue}</Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  fareCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fareLabel: {
    color: COLORS.APP_TEXT_MUTED,
  },
  fareValue: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  fareDivider: {
    // height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 4,
  },
  fareTotalLabel: {
    fontWeight: FontWeight.Normal,
    color: COLORS.APP_TEXT_MUTED,
  },
  fareTotalValue: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
  },
});
