import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppGradient, Icon, RowComponent, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { WORKER_EARNINGS_SUMMARY } from 'components/common/worker/workerMockData';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

const SUMMARY_ROWS = [
  { label: 'Today', amount: WORKER_EARNINGS_SUMMARY.today },
  { label: 'This Week', amount: WORKER_EARNINGS_SUMMARY.week },
  { label: 'This Month', amount: WORKER_EARNINGS_SUMMARY.month },
];

export const WorkerEarningsScreen = () => (
  <View style={styles.root}>
    <SafeAreaView edges={['top']} style={styles.safeTop}>
      <Typography style={styles.header}>Earnings</Typography>
    </SafeAreaView>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <AppGradient style={styles.totalCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.totalIconWrap}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='cash-multiple'
            size={40}
            color={COLORS.APP_PRIMARY}
          />
        </View>
        <View style={styles.totalInfo}>
          <Typography style={styles.totalLabel}>Total Earnings</Typography>
          <Typography style={styles.totalAmount}>{WORKER_EARNINGS_SUMMARY.total}</Typography>
        </View>
      </AppGradient>

      <View style={styles.summaryCard}>
        <Typography style={styles.summaryTitle}>Earning Summary</Typography>
        {SUMMARY_ROWS.map((row, index) => (
          <RowComponent
            key={row.label}
            style={[styles.summaryRow, index < SUMMARY_ROWS.length - 1 && styles.summaryRowBorder]}
          >
            <View style={styles.summaryIcon}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='wallet-outline'
                size={FontSize.Large}
                color={COLORS.WHITE}
              />
            </View>
            <Typography style={styles.summaryLabel}>{row.label}</Typography>
            <Typography style={styles.summaryAmount}>{row.amount}</Typography>
          </RowComponent>
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  safeTop: {
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
    paddingBottom: 120,
    gap: 16,
  },
  totalCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalInfo: {
    flex: 1,
    gap: 4,
  },
  totalLabel: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    opacity: 0.9,
  },
  totalAmount: {
    color: COLORS.WHITE,
    fontSize: 32,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  summaryRow: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.APP_LINE,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    flex: 1,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  summaryAmount: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
  },
});
