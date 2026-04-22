import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Icon, RowComponent } from 'components/common';
import { COLORS, STYLES } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import type { PaymentRequest } from 'api/functions/app/home';

const formatTime = (iso: string | null) => {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return COLORS.TEXT_SECONDARY;
    case 'completed':
      return COLORS.GREEN_STATUS;
    case 'failed':
      return COLORS.RED;
    default:
      return COLORS.TEXT_SECONDARY;
  }
};

export const WithdrawTransactionCard = memo(({ item }: { item: PaymentRequest }) => (
  <View style={styles.transactionCard}>
    <RowComponent style={styles.transactionContent}>
      <RowComponent style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <Icon
            componentName={VARIABLES.AntDesign}
            iconName='wallet'
            size={FontSize.Large}
            color={COLORS.ICONS}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Typography style={styles.transactionTitle}>Withdrawal</Typography>
          <Typography style={styles.transactionDescription}>
            {`${item.notes || `Request #${item.id}`} • ${item.status}`}
          </Typography>
        </View>
      </RowComponent>
      <View style={styles.transactionRight}>
        <Typography
          translate={false}
          style={[styles.transactionAmount, { color: getStatusColor(item.status) }]}
        >
          {`-$${parseFloat(item.amount).toFixed(2)}`}
        </Typography>
        <Typography translate={false} style={styles.transactionTime}>
          {formatTime(item.created_at)}
        </Typography>
      </View>
    </RowComponent>
  </View>
));

WithdrawTransactionCard.displayName = 'WithdrawTransactionCard';

const styles = StyleSheet.create({
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  transactionContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.TEXT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
});
