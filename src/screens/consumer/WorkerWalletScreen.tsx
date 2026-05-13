import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Typography, RowComponent, AppGradient } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

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
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.BACKGROUND }}>
        <Typography style={styles.header}>Wallet</Typography>
      </SafeAreaView>

      <FlatList
        data={DUMMY_TRANSACTIONS}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            {/* ── Balance Card ── */}
            <AppGradient
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIconWrap}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName="wallet-outline"
                  size={48}
                  color={COLORS.APP_PRIMARY}
                />
              </View>
              <View style={styles.cardInfo}>
                <Typography style={styles.cardLabel}>Available Balance</Typography>
                <Typography style={styles.cardAmount}>CFA 0</Typography>
                <Typography style={styles.cardSub}>Token balance for comission</Typography>
              </View>
            </AppGradient>

            {/* ── Recent Transactions heading ── */}
            <Typography style={styles.sectionTitle}>Recent Transaction</Typography>
          </>
        }
        renderItem={({ item }) => (
          <RowComponent style={styles.txRow}>
            <View style={styles.txIconWrap}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName="cash-multiple"
                size={FontSize.Large}
                color={COLORS.APP_PRIMARY}
              />
            </View>
            <View style={styles.txBody}>
              <Typography style={styles.txName}>{item.name}</Typography>
              <Typography style={styles.txType}>{item.type}</Typography>
            </View>
            <Typography style={styles.txAmount}>{item.amount}</Typography>
          </RowComponent>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.infoBox}>
            <Typography style={styles.infoText}>
              If you want to add funds to your wallet, contact the Admin to top it off.
            </Typography>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    paddingVertical: 16,
    color: COLORS.TEXT,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    opacity: 0.9,
  },
  cardAmount: {
    color: COLORS.WHITE,
    fontSize: 32,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
  },
  cardSub: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  txRow: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txBody: {
    flex: 1,
  },
  txName: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.TEXT,
    fontSize: FontSize.Small,
  },
  txType: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FontSize.ExtraSmall,
    marginTop: 2,
  },
  txAmount: {
    color: COLORS.ERROR,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 8,
  },
  infoBox: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.APP_SECONDARY,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#EFF6FF',
  },
  infoText: {
    color: COLORS.APP_SECONDARY,
    fontSize: FontSize.Small,
    lineHeight: 20,
  },
});
