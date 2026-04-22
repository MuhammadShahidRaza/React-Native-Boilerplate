import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Icon, RowComponent } from 'components/common';
import { COLORS, STYLES } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import type { WalletTransaction } from 'api/functions/app/home';

const formatTime = (iso: string | null) => {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const ReceivedTransactionCard = memo(({ item }: { item: WalletTransaction }) => (
  <View style={transactionCardStyles.transactionCard}>
    <RowComponent style={transactionCardStyles.transactionContent}>
      <RowComponent style={transactionCardStyles.transactionLeft}>
        <View style={transactionCardStyles.iconContainer}>
          <Icon
            componentName={VARIABLES.AntDesign}
            iconName='wallet'
            size={FontSize.Large}
            color={COLORS.ICONS}
          />
        </View>
        <View style={transactionCardStyles.transactionInfo}>
          <Typography style={transactionCardStyles.transactionTitle}>
            {item.transaction_type ?? 'Payment Received'}
          </Typography>
          <Typography style={transactionCardStyles.transactionDescription}>
            {item.description || `Transaction #${item.id}`}
          </Typography>
        </View>
      </RowComponent>
      <View style={transactionCardStyles.transactionRight}>
        <Typography
          translate={false}
          style={[transactionCardStyles.transactionAmount, { color: COLORS.GREEN_STATUS }]}
        >
          {`+$${parseFloat(item.amount).toFixed(2)}`}
        </Typography>
        <Typography translate={false} style={transactionCardStyles.transactionTime}>
          {formatTime(item.created_at)}
        </Typography>
      </View>
    </RowComponent>
  </View>
));

ReceivedTransactionCard.displayName = 'ReceivedTransactionCard';

export const transactionCardStyles = StyleSheet.create({
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
