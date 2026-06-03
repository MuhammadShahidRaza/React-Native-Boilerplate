import { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStatusModal, Icon, Typography, RowComponent, AppGradient } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { IMAGES } from 'constants/assets';
import { useAppSelector } from 'types/reduxTypes';
import { parseWalletBalance, WORKER_WALLET_TOP_OFF } from 'utils/workerOnboarding';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  getWorkerWalletSummary,
  getWorkerWalletTransactions,
  mapTransactionsToUi,
  parseWalletSummaryBalance,
} from 'api/functions/snlift/wallet';

type Transaction = {
  id: string;
  name: string;
  type: string;
  amount: string;
};

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Comission - John Doe', type: 'Parcel', amount: '-CFA 10.19' },
  { id: '2', name: 'Comission - John Doe', type: 'Food', amount: '-CFA 3' },
  { id: '3', name: 'Comission - John Doe', type: 'Parcel', amount: '-CFA 7.73' },
];

export const WorkerWalletScreen = () => {
  const user = useAppSelector(state => state.user.userDetails);
  const role = useAppSelector(state => state.user?.role);
  const [apiBalance, setApiBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(DUMMY_TRANSACTIONS);
  const balance = useMemo(
    () => (apiBalance !== null ? apiBalance : parseWalletBalance(user)),
    [apiBalance, user],
  );
  const [topOffVisible, setTopOffVisible] = useState(false);
  const topOffShownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const summary = await getWorkerWalletSummary(role);
      const txRes = await getWorkerWalletTransactions(role);
      if (cancelled) return;
      const balance = parseWalletSummaryBalance(summary);
      if (balance !== null) setApiBalance(balance);
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

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.BACKGROUND }}>
        <Typography style={styles.header}>Wallet</Typography>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        

        <AppGradient colors={[BRAND_SECONDARY, BRAND_PRIMARY]} fill style={styles.card}>
          <View style={styles.cardIconWrap}>
            <Image source={IMAGES.WALLET} style={styles.cardIcon} />
          </View>
          <View style={styles.cardInfo}>
            <Typography style={styles.cardLabel}>Available Balance</Typography>
            <Typography style={styles.cardAmount}>{`CFA ${balance}`}</Typography>
            <Typography style={styles.cardSub}>Token balance for comission</Typography>
          </View>
        </AppGradient>

        <View style={styles.summaryCard}>
          <Typography style={styles.summaryTitle}>Recent Transaction</Typography>
          {transactions.map((item, index) => (
            <RowComponent
              key={item.id}
              style={[styles.txRow, index < transactions.length - 1 && styles.txRowBorder]}
            >
              <AppGradient colors={[BRAND_SECONDARY, BRAND_PRIMARY]} fill style={styles.summaryIcon}>
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
              <Typography style={styles.txAmount}>{item.amount}</Typography>
            </RowComponent>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Typography style={styles.infoText}>
            If you want to add funds to your wallet, contact the Admin to top it off.
          </Typography>
        </View>
      </ScrollView>

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
  scroll: { paddingHorizontal: 16, paddingBottom: 120, gap: 16 },
  completeBanner: {
    backgroundColor: '#D5E3F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_SECONDARY,
  },
  completeBannerTitle: {
    fontWeight: FontWeight.Bold,
    color: BRAND_SECONDARY,
    fontSize: FontSize.Medium,
    marginBottom: 4,
  },
  completeBannerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FontSize.Small,
    lineHeight: 18,
  },
  card: {
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
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
    textAlign: 'center',
  },
  cardAmount: {
    color: COLORS.WHITE,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
    textAlign: 'center',
  },
  cardSub: {
    color: COLORS.WHITE,
    fontSize: FontSize.MediumSmall,
    opacity: 0.8,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
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
  txType: { color: COLORS.TEXT_SECONDARY, fontSize: FontSize.ExtraSmall, marginTop: 2 },
  txAmount: { color: COLORS.ERROR, fontWeight: FontWeight.SemiBold, fontSize: FontSize.Small },
  infoBox: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: BRAND_SECONDARY,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#D5E3F6',
  },
  infoText: { color: BRAND_SECONDARY, fontSize: FontSize.MediumSmall, lineHeight: 20 },
  cardIcon: { width: 50, height: 50, resizeMode: 'contain' },
});
