import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, FlatListComponent, Wrapper } from 'components/index';
import { COLORS, screenWidth } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { getWallet } from 'api/functions/app/home';
import type { PaymentRequest, WalletTransaction } from 'api/functions/app/home';
import NoItemFound from 'components/common/NoItemFound';
import {
  ReceivedTransactionCard,
  WithdrawTransactionCard,
  TransactionCardSkeleton,
} from 'components/appComponents';

type TabType = 'received' | 'withdraw';

export const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWallet();
      setWalletTransactions(res?.data?.wallet ?? []);
      setPaymentRequests(res?.payment_requests ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const receivedList = walletTransactions.filter(t => t.type === 'credit');
  const withdrawList = paymentRequests;

  const renderReceivedCard = useCallback(
    ({ item }: { item: WalletTransaction }) => <ReceivedTransactionCard item={item} />,
    [],
  );

  const renderWithdrawCard = useCallback(
    ({ item }: { item: PaymentRequest }) => <WithdrawTransactionCard item={item} />,
    [],
  );

  return (
    <Wrapper useScrollView={false} headerTitle='Transaction History'>
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.tabActive]}
            onPress={() => setActiveTab('received')}
            activeOpacity={0.7}
          >
            <Typography
              style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}
              fontWeight={activeTab === 'received' ? FontWeight.SemiBold : FontWeight.Normal}
            >
              Received
            </Typography>
            {activeTab === 'received' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'withdraw' && styles.tabActive]}
            onPress={() => setActiveTab('withdraw')}
            activeOpacity={0.7}
          >
            <Typography
              style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}
              fontWeight={activeTab === 'withdraw' ? FontWeight.SemiBold : FontWeight.Normal}
            >
              Withdraw
            </Typography>
            {activeTab === 'withdraw' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {activeTab === 'received' ? (
          <FlatListComponent
            data={receivedList}
            renderItem={renderReceivedCard}
            contentContainerStyle={styles.listContent}
            keyExtractor={item => `received-${item.id}`}
            onRefresh={fetchWallet}
            scrollEnabled={true}
            refreshing={loading && receivedList.length > 0}
            ListEmptyComponent={
              loading ? (
                <TransactionCardSkeleton />
              ) : (
                <NoItemFound message='No received transactions' />
              )
            }
          />
        ) : (
          <FlatListComponent
            data={withdrawList}
            renderItem={renderWithdrawCard}
            contentContainerStyle={styles.listContent}
            keyExtractor={item => `withdraw-${item.id}`}
            onRefresh={fetchWallet}
            scrollEnabled={true}
            refreshing={loading && withdrawList.length > 0}
            ListEmptyComponent={
              loading ? (
                <TransactionCardSkeleton />
              ) : (
                <NoItemFound message='No withdrawal requests' />
              )
            }
          />
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    width: screenWidth(50),
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
