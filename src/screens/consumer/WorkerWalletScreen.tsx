import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  AppStatusModal,
  Button,
  Icon,
  Input,
  ModalComponent,
  Typography,
  RowComponent,
  AppGradient,
} from 'components/index';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS, screenWidth, showToast, formatMoney } from 'utils/index';
import { IMAGES } from 'constants/assets';
import { useAppSelector } from 'types/reduxTypes';
import type { User } from 'types/index';
import { parseWalletBalance, WORKER_WALLET_TOP_OFF } from 'utils/workerOnboarding';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  getWorkerWalletSummary,
  getWorkerWalletTransactions,
  mapTransactionsToUi,
  parseWalletSummaryBalance,
} from 'api/functions/snlift/wallet';
import { getStripeConnectLink, requestWithdrawAmount } from 'api/functions/app/home';
import { getUserDetails } from 'api/functions/app/user';
import { ENV_CONSTANTS } from 'constants/common';
import { VARIANT_ID } from 'config/variant';
import { ALPHA_WORKER_WALLET_SUMMARY } from 'components/common/worker/workerMockData';

const IS_SENGO_WORKERS = VARIANT_ID === 'sengoWorkers';

type Transaction = {
  id: string;
  name: string;
  type: string;
  amount: string;
  isCredit: boolean;
};

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Comission - John Doe', type: 'Parcel', amount: 'CFA 10.19', isCredit: false },
  { id: '2', name: 'Comission - John Doe', type: 'Food', amount: 'CFA 3', isCredit: false },
  { id: '3', name: 'Comission - John Doe', type: 'Parcel', amount: 'CFA 7.73', isCredit: false },
];

const hasStripeAccount = (user: User | null) =>
  user?.is_stripe_onboarded && user?.stripe_connect_id;

export const WorkerWalletScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.user.userDetails);
  const role = useAppSelector(state => state.user?.role);
  const [apiBalance, setApiBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    ENV_CONSTANTS.IS_ALPHA_PHASE ? DUMMY_TRANSACTIONS : [],
  );
  const [amount, setAmount] = useState('');
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeConnectUrl, setStripeConnectUrl] = useState<string | null>(null);
  const balance = useMemo(
    () => (apiBalance !== null ? apiBalance : parseWalletBalance(user)),
    [apiBalance, user],
  );
  const [topOffVisible, setTopOffVisible] = useState(false);
  const topOffShownRef = useRef(false);

  const stripeConnected = hasStripeAccount(user);

  useLayoutEffect(() => {
    if (IS_SENGO_WORKERS || ENV_CONSTANTS.IS_ALPHA_PHASE) {
      getUserDetails();
    }
  }, []);

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setApiBalance(ALPHA_WORKER_WALLET_SUMMARY.wallet_balance);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      const summary = await getWorkerWalletSummary(role);
      const txRes = await getWorkerWalletTransactions(role);
      if (cancelled) return;
      const walletBalance = parseWalletSummaryBalance(summary);
      if (walletBalance !== null) setApiBalance(walletBalance);
      const txUi = mapTransactionsToUi(txRes);
      if (txUi.length > 0) {
        setTransactions(txUi);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (balance > 0 || topOffShownRef.current) return;
    topOffShownRef.current = true;
    setTopOffVisible(true);
  }, [balance]);

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

  const handleContinueWithdraw = () => {
    if (!stripeConnected) return;
    setIsWithdrawModalVisible(true);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.BACKGROUND }}>
        <Typography style={styles.header}>Wallet</Typography>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: IS_SENGO_WORKERS ? 120 + insets.bottom : 120 },
        ]}
      >
        <AppGradient colors={[...APP_GRADIENT_HORIZONTAL]} fill style={styles.card}>
          <View style={styles.cardIconWrap}>
            <Image source={IMAGES.WALLET} style={styles.cardIcon} />
          </View>
          <View style={styles.cardInfo}>
            <Typography style={styles.cardLabel}>Available Balance</Typography>
            <Typography style={styles.cardAmount}>{formatMoney(balance)}</Typography>
          </View>
        </AppGradient>

        {transactions?.length > 0 && (
          <View style={styles.summaryCard}>
            <Typography style={styles.summaryTitle}>Recent Transaction</Typography>
            {transactions.map((item, index) => (
              <RowComponent
                key={item.id}
                style={[styles.txRow, index < transactions.length - 1 && styles.txRowBorder]}
              >
                <AppGradient colors={[...APP_GRADIENT_HORIZONTAL]} fill style={styles.summaryIcon}>
                  <Icon
                    componentName={VARIABLES.Ionicons}
                    iconName='wallet-outline'
                    size={15}
                    color={COLORS.WHITE}
                  />
                </AppGradient>
                <View style={styles.txBody}>
                  <Typography style={styles.txName}>{item.name}</Typography>
                  <Typography style={styles.txType}>{item.type}</Typography>
                </View>
                <Typography
                  style={[styles.txAmount, item.isCredit ? styles.txAmountCredit : styles.txAmountDebit]}
                >
                  {`${item.isCredit ? '+' : '-'}${item.amount}`}
                </Typography>
              </RowComponent>
            ))}
          </View>
        )}

        {IS_SENGO_WORKERS ? (
          <View style={styles.withdrawSection}>
            <RowComponent style={styles.withdrawSectionHeader}>
              <Typography style={styles.withdrawSectionTitle}>Withdraw Money To</Typography>
              {!stripeConnected ? (
                <TouchableOpacity
                  onPress={handleAddStripeAccount}
                  disabled={isConnectingStripe}
                  style={styles.headerAddAccountBtn}
                >
                  {isConnectingStripe ? (
                    <ActivityIndicator size='small' color={COLORS.WHITE} />
                  ) : (
                    <Typography style={styles.headerAddAccountText}>+ Add Account</Typography>
                  )}
                </TouchableOpacity>
              ) : null}
            </RowComponent>

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
                  Add your Stripe account to receive payments from completed jobs directly to your
                  bank.
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
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Typography style={styles.infoText}>
              If you want to add funds to your wallet, contact the Admin to top it off.
            </Typography>
          </View>
        )}
      </ScrollView>

      {IS_SENGO_WORKERS ? (
        <>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 100) }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinueWithdraw}
              disabled={!stripeConnected}
              style={!stripeConnected && styles.continueWithdrawDisabled}
            >
              <AppGradient
                colors={[...APP_GRADIENT_HORIZONTAL]}
                fill
                style={styles.continueWithdrawBtn}
              >
                <Typography style={styles.continueWithdrawText}>Continue Withdraw</Typography>
              </AppGradient>
            </TouchableOpacity>
          </View>

          <ModalComponent
            modalVisible={isWithdrawModalVisible}
            setModalVisible={setIsWithdrawModalVisible}
            position='center'
            closeIcon
            wantToCloseOnBack
            children={
              <View style={styles.modalContent}>
                <Typography style={styles.modalTitle}>Enter Withdrawl Amount</Typography>
                <Input
                  title='Enter Amount'
                  name='amount'
                  placeholder='Enter amount'
                  keyboardType='number-pad'
                  value={amount}
                  onChangeText={setAmount}
                  maxLength={8}
                />
                <Button
                  disabled={!amount || Number(amount) > balance || Number(amount) <= 0}
                  title='Request Amount'
                  onPress={async () => {
                    setIsWithdrawModalVisible(false);
                    const response = await requestWithdrawAmount({ amount: Number(amount) });
                    if (response) {
                      setAmount('');
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
            onConfirm={() => setIsSuccessModalVisible(false)}
            messageTextStyle={{ fontSize: FontSize.Large, fontWeight: FontWeight.Medium }}
            wantTwoButtons={false}
            primaryButtonText='Continue'
            confirmButtonStyle={{ maxWidth: screenWidth(60) }}
            description={
              COMMON_TEXT.YOUR_REQUEST_HAS_BEEN_SUBMITTED_TO_THE_ADMIN_YOU_WILL_BE_INFORMED_ONCE_APPROVED
            }
          />

          <Modal
            visible={!!stripeConnectUrl}
            animationType='slide'
            presentationStyle='fullScreen'
            onRequestClose={() => setStripeConnectUrl(null)}
          >
            {stripeConnectUrl ? (
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
                  scrollEnabled
                  nestedScrollEnabled
                  renderLoading={() => (
                    <View style={styles.stripeWebViewLoader}>
                      <ActivityIndicator size='large' color={COLORS.PRIMARY} />
                    </View>
                  )}
                />
              </View>
            ) : null}
          </Modal>
        </>
      ) : null}

      <AppStatusModal
        visible={topOffVisible}
        onClose={() => setTopOffVisible(false)}
        onPrimaryPress={() => navigate(SCREENS.CONTACT_US)}
        title={WORKER_WALLET_TOP_OFF.title}
        description={WORKER_WALLET_TOP_OFF.description}
        primaryButtonText={WORKER_WALLET_TOP_OFF.primaryButtonText}
        iconProps={{
          componentName: VARIABLES.MaterialCommunityIcons,
          iconName: 'close',
          size: 32,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    paddingVertical: 16,
    color: COLORS.TEXT,
  },
  scroll: { paddingHorizontal: 16, gap: 16 },
  card: {
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  cardIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardLabel: {
    color: COLORS.WHITE,
    fontSize: FontSize.Large,
    opacity: 0.9,
  },
  cardAmount: {
    color: COLORS.WHITE,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  summaryIcon: {
    width: 35,
    height: 35,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  txRow: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.APP_LINE },
  txBody: { flex: 1 },
  txName: { fontWeight: FontWeight.SemiBold, color: COLORS.TEXT, fontSize: FontSize.Small },
  txType: { color: COLORS.TEXT_SECONDARY, fontSize: FontSize.ExtraSmall, marginTop: 2, textTransform: 'capitalize' },
  txAmount: { fontWeight: FontWeight.SemiBold, fontSize: FontSize.Small },
  txAmountCredit: { color: COLORS.GREEN_STATUS },
  txAmountDebit: { color: COLORS.ERROR },
  infoBox: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.APP_SECONDARY,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#D5E3F6',
  },
  infoText: { color: COLORS.APP_SECONDARY, fontSize: FontSize.MediumSmall, lineHeight: 20 },
  cardIcon: { width: 50, height: 50, resizeMode: 'contain' },
  withdrawSection: { gap: 12 },
  withdrawSectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawSectionTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  headerAddAccountBtn: {
    backgroundColor: COLORS.TEXT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  headerAddAccountText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
  paymentMethodContainer: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  paymentMethodRow: {
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 40,
    width: 1,
    backgroundColor: COLORS.BORDER,
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
  addAccountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    backgroundColor: COLORS.SURFACE,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  continueWithdrawBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueWithdrawText: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
  },
  continueWithdrawDisabled: {
    opacity: 0.5,
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
