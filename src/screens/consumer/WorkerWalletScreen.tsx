import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Typography, RowComponent, AppGradient } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { IMAGES } from 'constants/assets';

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AppGradient
          colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
          start={{ x: -1, y: 0 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.card}
        >
          <View style={styles.cardIconWrap}>
            <Image source={IMAGES.WALLET} style={styles.cardIcon} />
          </View>
          <View style={styles.cardInfo}>
            <Typography style={styles.cardLabel}>Available Balance</Typography>
            <Typography style={styles.cardAmount}>CFA 0</Typography>
            <Typography style={styles.cardSub}>Token balance for comission</Typography>
          </View>
        </AppGradient>

        <View style={styles.summaryCard}>
          <Typography style={styles.summaryTitle}>Recent Transaction</Typography>
          {DUMMY_TRANSACTIONS.map((item, index) => (
            <RowComponent
              key={item.id}
              style={[styles.txRow, index < DUMMY_TRANSACTIONS.length - 1 && styles.txRowBorder]}
            >
            <AppGradient
              colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
              start={{ x: -1, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.summaryIcon}
            >
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
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 25,
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
    fontSize: FontSize.ExtraLarge,
    opacity: 0.9,
    textAlign: 'center',
  },
  cardAmount: {
    color: COLORS.WHITE,
    fontSize: FontSize.Enormous,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
    textAlign: 'center',
  },
  cardSub: {
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: COLORS.APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  txRow: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.APP_LINE,
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
  infoText: {
    color: BRAND_SECONDARY,
    fontSize: FontSize.Medium,
  
    lineHeight: 20,
  },
  cardIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
