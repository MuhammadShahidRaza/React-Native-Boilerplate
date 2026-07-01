import { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  Typography,
  Button,
  Icon,
  RowComponent,
  Wrapper,
  ModalComponent,
  Input,
} from 'components/index';
import { COLORS, STYLES, screenWidth, showToast } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { COMMON_TEXT } from 'constants/screens';
import { RootState, useAppSelector, User } from 'types/index';
import { requestWithdrawAmount, getStripeConnectLink, getWallet } from 'api/functions/app/home';
import type { WalletTransaction } from 'api/functions/app/home';
import { getUserDetails } from 'api/functions/app/user';
import { ReceivedTransactionCard, TransactionCardSkeleton } from 'components/appComponents';

const hasStripeAccount = (user: User | null) =>
  user?.is_stripe_onboarded && user?.stripe_connect_id;

export const MyWallet = () => {
  const insets = useSafeAreaInsets();
  const { userDetails } = useAppSelector((state: RootState) => state.user);
  const [amount, setAmount] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeConnectUrl, setStripeConnectUrl] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  // getUserById
  useLayoutEffect(() => {
    const fetchUserDetails = async () => {
      await getUserDetails();
    };
    fetchUserDetails();
  }, []);

  const stripeConnected = hasStripeAccount(userDetails);

  const fetchTransactions = useCallback(async () => {
    if (!stripeConnected) return;
    setTransactionsLoading(true);
    try {
      const res = await getWallet();
      const wallet = res?.data?.wallet ?? [];
      const credits = wallet.filter((t: WalletTransaction) => t.type === 'credit');
      setTransactions(credits);
    } finally {
      setTransactionsLoading(false);
    }
  }, [stripeConnected]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleWithdraw = () => {
    if (!stripeConnected) return;
    setIsModalVisible(true);
  };

  const handleAddStripeAccount = async () => {
    setIsConnectingStripe(true);
    try {
      const url = await getStripeConnectLink();
      if (url) {
        setStripeConnectUrl(url);
      } else {
        Alert.alert('Error', 'Could not get Stripe Connect link. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleStripeSuccess = useCallback(() => {
    setStripeConnectUrl(null);
    getUserDetails();
    showToast({ message: 'Stripe account connected successfully', isError: false });
  }, []);

  const handleStripeNavigationStateChange = useCallback(
    (navState: { url?: string; title?: string }) => {
      const url = (navState?.url ?? '').toLowerCase();
      const title = (navState?.title ?? '').toLowerCase();
      if (!url) return;
      const isSuccess =
        (url.includes('stripe/connect/return') && url.includes('account_id=')) ||
        title.includes('stripe connect - success') ||
        title.includes('success') ||
        url.includes('status=success') ||
        url.includes('stripe=success') ||
        url.includes('/stripe/success') ||
        url.includes('connected=true') ||
        url.includes('onboarding=complete');
      const isReject =
        url.includes('status=cancel') ||
        url.includes('status=reject') ||
        url.includes('stripe=cancel') ||
        url.includes('/stripe/cancel') ||
        url.includes('denied');
      if (isSuccess) {
        handleStripeSuccess();
      } else if (isReject) {
        setStripeConnectUrl(null);
        showToast({ message: 'Stripe connection cancelled', isError: false });
      }
    },
    [handleStripeSuccess],
  );

  const handleStripeWebViewError = useCallback(
    (syntheticEvent: { nativeEvent: { url?: string; description?: string } }) => {
      const url = (syntheticEvent?.nativeEvent?.url ?? '').toLowerCase();
      if (url.includes('stripe/connect/return') && url.includes('account_id=')) {
        handleStripeSuccess();
      }
    },
    [handleStripeSuccess],
  );

  const handleSeeAll = () => {
    navigate(SCREENS.TRANSACTION_HISTORY);
  };

  return (
    <Wrapper useScrollView={true} headerTitle='My Wallet'>
      <View style={[STYLES.CONTAINER, styles.container]}>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Typography style={styles.balanceLabel}>Balance</Typography>
          <Typography style={styles.balanceAmount}>{`$${userDetails?.balance}`}</Typography>
          {userDetails?.upcoming_balance && (
            <Typography
              style={styles.upcomingBalance}
            >{`+$${userDetails?.upcoming_balance} upcoming`}</Typography>
          )}

          <Button
            title='Withdraw'
            onPress={handleWithdraw}
            disabled={!stripeConnected}
            style={[styles.withdrawButton, !stripeConnected && styles.withdrawButtonDisabled]}
            textStyle={styles.withdrawButtonText}
          />

          <Typography style={styles.withdrawNote}>Will be received within 2 days</Typography>
        </View>

        {/* Payment Method Section */}
        {stripeConnected ? (
          <View style={styles.paymentMethodContainer}>
            <RowComponent style={styles.paymentMethodRow}>
              <View style={styles.stripeBadge}>
                <Typography style={styles.stripeText}>stripe</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentMethodInfo}>
                <Typography style={styles.paymentMethodName}>Stripe Connect</Typography>
                <Typography style={styles.paymentMethodCard}>Account connected</Typography>
              </View>
            </RowComponent>
          </View>
        ) : (
          <View style={styles.addAccountCard}>
            <View style={styles.addAccountIconWrapper}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='bank-outline'
                size={40}
                color={COLORS.PRIMARY}
              />
            </View>
            <Typography style={styles.addAccountTitle}>Connect your Stripe account</Typography>
            <Typography style={styles.addAccountDescription}>
              Add your Stripe account to receive payments from completed jobs directly to your bank.
            </Typography>
            <View style={styles.addAccountButtonWrapper}>
              <Button
                title='Add Account'
                loading={isConnectingStripe}
                onPress={handleAddStripeAccount}
                style={styles.addAccountButton}
                textStyle={styles.addAccountButtonText}
              />
            </View>
          </View>
        )}

        {/* Transactions Section */}
        {stripeConnected && (
          <View style={styles.transactionsSection}>
            <RowComponent style={styles.transactionsHeader}>
              <Typography style={styles.transactionsTitle}>Transactions</Typography>
            </RowComponent>
            <RowComponent style={styles.transactionsHeaderRight}>
              <View style={styles.completedBadge}>
                <Typography style={styles.completedText}>Completed</Typography>
              </View>
              <TouchableOpacity onPress={handleSeeAll}>
                <Typography style={styles.seeAllText}>See All</Typography>
              </TouchableOpacity>
            </RowComponent>

            <View style={styles.transactionsList}>
              {transactionsLoading ? (
                <TransactionCardSkeleton />
              ) : transactions.length === 0 ? (
                <Typography
                  style={[
                    styles.transactionDescription,
                    { textAlign: 'center', paddingVertical: 20 },
                  ]}
                >
                  No transactions yet
                </Typography>
              ) : (
                transactions.map(transaction => (
                  <ReceivedTransactionCard key={transaction.id} item={transaction} />
                ))
              )}
            </View>
          </View>
        )}
      </View>
      <ModalComponent
        modalVisible={isModalVisible}
        setModalVisible={setIsModalVisible}
        position={'center'}
        closeIcon={true}
        wantToCloseOnBack={true}
        children={
          <View style={styles.modalContent}>
            <Typography style={styles.modalTitle}>Enter Withdrawal Amount</Typography>
            <Input
              title='Enter Amount'
              name='amount'
              placeholder='Enter amount'
              keyboardType='number-pad'
              value={amount}
              onChangeText={setAmount}
              maxLength={5}
              startIcon={{
                componentName: VARIABLES.FontAwesome,
                iconName: 'dollar',
                size: FontSize.Medium,
                color: COLORS.ICONS,
              }}
            />
            <Button
              disabled={
                !amount || Number(amount) > Number(userDetails?.balance ?? 0) || Number(amount) <= 0
              }
              title='Request Amount'
              onPress={async () => {
                setIsModalVisible(false);
                const response = await requestWithdrawAmount({ amount: Number(amount) });
                if (response) {
                  setIsSuccessModalVisible(true);
                }
              }}
            />
          </View>
        }
      />

      <SuccessFailureModal
        isVisible={isSuccessModalVisible}
        setIsVisible={setIsSuccessModalVisible}
        onConfirm={() => {
          setIsSuccessModalVisible(false);
        }}
        messageTextStyle={{ fontSize: FontSize.Large, fontWeight: FontWeight.Medium }}
        wantTwoButtons={false}
        primaryButtonText='Continue'
        confirmButtonStyle={{ maxWidth: screenWidth(60) }}
        description={
          COMMON_TEXT.YOUR_REQUEST_HAS_BEEN_SUBMITTED_TO_THE_ADMIN_YOU_WILL_BE_INFORMED_ONCE_APPROVED
        }
      />

      {/* Stripe Connect WebView - Full Screen in Modal (scroll works outside ScrollView) */}

      <Modal
        visible={!!stripeConnectUrl}
        animationType='slide'
        presentationStyle='fullScreen'
        onRequestClose={() => setStripeConnectUrl(null)}
      >
        {stripeConnectUrl && (
          <View
            style={[
              styles.stripeWebViewFullScreen,
              { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
          >
            <StatusBar barStyle='dark-content' backgroundColor={COLORS.SURFACE} />
            <View style={styles.stripeWebViewHeader}>
              <Typography style={styles.stripeWebViewTitle}>Connect Stripe</Typography>
              <TouchableOpacity
                onPress={() => setStripeConnectUrl(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon
                  componentName={VARIABLES.MaterialIcons}
                  iconName='close'
                  size={24}
                  color={COLORS.TEXT}
                />
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: stripeConnectUrl }}
              style={styles.stripeWebView}
              onNavigationStateChange={handleStripeNavigationStateChange}
              onError={handleStripeWebViewError}
              startInLoadingState
              scrollEnabled={true}
              nestedScrollEnabled={true}
              renderLoading={() => (
                <View style={styles.stripeWebViewLoader}>
                  <ActivityIndicator size='large' color={COLORS.PRIMARY} />
                </View>
              )}
            />
          </View>
        )}
      </Modal>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 40,
    width: 1,
    backgroundColor: COLORS.BORDER,
  },
  container: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: FontSize.XXXL,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  upcomingBalance: {
    fontSize: FontSize.Medium,
    // color: COLORS.TEXT_SECONDARY,
    fontWeight: FontWeight.Medium,
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: screenWidth(60),
    marginBottom: 8,
  },
  withdrawButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  addAccountCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    backgroundColor: COLORS.SURFACE,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addAccountIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.PRIMARY}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addAccountTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  addAccountDescription: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  addAccountButtonWrapper: {
    minHeight: 48,
    justifyContent: 'center',
  },
  addAccountButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  addAccountButtonText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
  },
  withdrawNote: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
    color: COLORS.ICONS,
  },
  paymentMethodContainer: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  paymentMethodRow: {
    alignItems: 'center',
    gap: 12,
  },
  stripeBadge: {
    backgroundColor: '#635BFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stripeText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    textAlign: 'center',
    fontWeight: FontWeight.Medium,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  paymentMethodCard: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionsSection: {
    borderRadius: 16,
    padding: 15,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  transactionsHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionsTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  transactionsHeaderRight: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginVertical: 10,
  },
  completedBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  completedText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
  },
  seeAllText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionsList: {
    gap: 0,
  },
  transactionItem: {
    paddingVertical: 12,
  },
  transactionRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.INPUT_BACKGROUND,
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
  transactionDivider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginTop: 12,
  },
  modalContent: {
    padding: 20,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    gap: 20,
  },
  modalTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  stripeWebViewFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: COLORS.SURFACE,
    zIndex: 9999,
    flexDirection: 'column',
  },
  stripeWebViewModal: {
    width: Dimensions.get('window').width - 24,
    height: Dimensions.get('window').height * 0.85,
    padding: 0,
    overflow: 'hidden',
  },
  stripeWebViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  stripeWebViewTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  stripeWebView: {
    flex: 1,
    width: '100%',
    minHeight: 400,
  },
  stripeWebViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
