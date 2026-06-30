import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppGradient, Icon, RowComponent, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS, formatMoney } from 'utils/index';
import { FONT_FAMILY, IMAGES } from 'constants/assets';
import { WORKER_EARNINGS_SUMMARY } from 'components/common/worker/workerMockData';
import { getWorkerWalletSummary } from 'api/functions/snlift/wallet';
import { ENV_CONSTANTS } from 'constants/common';
import { useAppSelector } from 'types/reduxTypes';

export const WorkerEarningsScreen = () => {
  const role = useAppSelector(state => state.user?.role);
  const [total, setTotal] = useState(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? WORKER_EARNINGS_SUMMARY.total : formatMoney(0),
  );
  const [today, setToday] = useState(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? WORKER_EARNINGS_SUMMARY.today : formatMoney(0),
  );
  const [week, setWeek] = useState(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? WORKER_EARNINGS_SUMMARY.week : formatMoney(0),
  );
  const [month, setMonth] = useState(
    ENV_CONSTANTS.IS_ALPHA_PHASE ? WORKER_EARNINGS_SUMMARY.month : formatMoney(0),
  );

  useEffect(() => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) return;
    let cancelled = false;
    (async () => {
      try {
        const summary = await getWorkerWalletSummary(role);
        if (cancelled || !summary) return;
        setTotal(formatMoney(summary.total_earnings));
        setToday(formatMoney(summary.today_earnings));
        setWeek(formatMoney(summary.week_earnings));
        setMonth(formatMoney(summary.month_earnings));
      } catch {
        // keep initial state on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const summaryRows = [
    { label: 'Today', amount: today },
    { label: 'This Week', amount: week },
    { label: 'This Month', amount: month },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <Typography style={styles.header}>Earnings</Typography>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppGradient colors={[...APP_GRADIENT_HORIZONTAL]} fill style={styles.totalCard}>
          <View style={styles.totalIconWrap}>
            <Image source={IMAGES.BAG} style={styles.totalIcon} />
          </View>
          <View style={styles.totalInfo}>
            <Typography style={styles.totalLabel}>Total Earnings</Typography>
            <Typography style={styles.totalAmount}>{total}</Typography>
          </View>
        </AppGradient>

        <View style={styles.summaryCard}>
          <Typography style={styles.summaryTitle}>Earning Summary</Typography>
          {summaryRows.map((row, index) => (
            <RowComponent
              key={row.label}
              style={[styles.summaryRow, index < summaryRows.length - 1 && styles.summaryRowBorder]}
            >
              <AppGradient colors={[...APP_GRADIENT_HORIZONTAL]} fill style={styles.summaryIcon}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName='wallet-outline'
                  size={15}
                  color={COLORS.WHITE}
                />
              </AppGradient>

              <Typography style={styles.summaryLabel}>{row.label}</Typography>
              <Typography style={styles.summaryAmount}>{row.amount}</Typography>
            </RowComponent>
          ))}
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
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  totalIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 25,
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
    fontSize: FontSize.Large,
    opacity: 0.9,
    textAlign: 'center',
  },
  totalAmount: {
    color: COLORS.WHITE,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.Bold,
    lineHeight: 40,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // elevation: 2,
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
    width: 35,
    height: 35,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryLabel: {
    flex: 1,
    fontSize: FontSize.Medium,
    fontFamily: FONT_FAMILY.POPPINS.MEDIUM,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  summaryAmount: {
    fontSize: FontSize.Medium,
    fontFamily: FONT_FAMILY.POPPINS.MEDIUM,
    fontWeight: FontWeight.Medium,
    color: '#09C50F',
  },
  totalIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
