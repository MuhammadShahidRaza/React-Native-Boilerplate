import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppGradient, Button, Icon, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { getWorkerRequestDetail } from 'components/common/worker/workerMockData';
import { setLookingForDeliveries } from 'store/slices/worker';
import { useAppDispatch } from 'types/reduxTypes';

export const WorkerJobCompletedScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_JOB_COMPLETED>>();
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const detail = useMemo(
    () => getWorkerRequestDetail(route.params?.requestId ?? '1'),
    [route.params?.requestId],
  );

  const finish = () => {
    dispatch(setLookingForDeliveries(false));
    reset(SCREENS.BOTTOM_STACK);
  };

  return (
    <Wrapper
      showBackButton={false}
      useScrollView={false}
      backgroundColor={COLORS.BACKGROUND}
      darkMode={false}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppGradient
          colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
          start={{ x: -1, y: -1 }}
          end={{ x: 1, y: -1 }}
          style={styles.successIcon}
        >
          <Icon
            componentName={VARIABLES.Entypo}
            iconName='check'
            size={FontSize.Huge}
            color={COLORS.WHITE}
          />
        </AppGradient>

        <Typography style={styles.title}>{copy.jobCompletedTitle}</Typography>
        <Typography style={styles.subtitle}>{copy.jobCompletedSubtitle}</Typography>

        <View style={styles.card}>
          <Typography style={styles.cardTitle}>Fare Breakdown</Typography>
          <Row label='Base Fare' value={detail.baseFare} />
          <Row label='Commission (15%)' value={detail.commission} valueStyle={styles.commission} />
          <View style={styles.earnedRow}>
            <Typography style={styles.earnedLabel}>You Earned</Typography>
            <Typography style={styles.earnedValue}>{detail.earned}</Typography>
          </View>
        </View>

        <View style={styles.card}>
          <Typography style={styles.cardTitle}>Wallet Update</Typography>
          <View style={styles.walletRow}>
            <View style={styles.walletCol}>
              <Typography style={styles.walletLabel}>Previous balance</Typography>
              <Typography style={styles.walletAmount}>{detail.previousWallet}</Typography>
            </View>
            <Icon
              componentName={VARIABLES.FontAwesome}
              iconName='long-arrow-right'
              size={FontSize.Large}
              iconStyle={{marginBottom: 5}}
              color={COLORS.APP_TEXT_MUTED}
            />
            <View style={[styles.walletCol, styles.walletColEnd]}>
              <Typography style={styles.walletLabel}>New Balance</Typography>
              <Typography style={styles.walletAmount}>{detail.newWallet}</Typography>
            </View>
          </View>
        </View>

        <Button title='Finish' onPress={finish} style={styles.finishBtn} />
      </ScrollView>
    </Wrapper>
  );
};

const Row = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) => (
  <View style={styles.row}>
    <Typography style={styles.rowLabel}>{label}</Typography>
    <Typography style={[styles.rowValue, valueStyle]}>{value}</Typography>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: FontSize.ExtraExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.Small,

    textAlign: 'center',
    // marginTop: 8,
    color: COLORS.BLACK,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  rowValue: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  commission: {
    color: COLORS.ERROR,
  },
  earnedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
  },
  earnedLabel: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  earnedValue: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  walletCol: {
    flex: 1,
    gap: 4,
  },
  walletColEnd: {
    alignItems: 'flex-end',
  },
  walletLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  walletAmount: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  finishBtn: {
    width: '100%',
    marginTop: 100,
    backgroundColor: '#21409A',
  },
});
