import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Button,
  Photo,
  Typography,
  WorkerRouteAddresses,
  WorkerRequestTimer,
  Wrapper,
} from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { navigate, onBack } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { getWorkerRequestDetail } from 'components/common/worker/workerMockData';

const BACK_ICON = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

export const WorkerRequestDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_REQUEST_DETAIL>>();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const detail = useMemo(
    () => getWorkerRequestDetail(route.params?.requestId ?? '1'),
    [route.params?.requestId],
  );

  const accept = () => {
    navigate(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId: detail.id,
      phase: 'pickup',
    });
  };

  return (
    <Wrapper
      headerTitle={copy.requestDetailTitle}
      showBackButton
      backIconStyle={BACK_ICON}
      useScrollView={false}
      backgroundColor={COLORS.BACKGROUND}
      darkMode={false}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <WorkerRequestTimer seconds={60} onExpire={onBack} />

        <View style={styles.paymentBadge}>
          <Typography style={styles.paymentTxt}>{detail.payment}</Typography>
        </View>

        <View style={styles.passengerCard}>
          <Photo source={IMAGES.USER} size={52} borderRadius={26} />
          <Typography style={styles.passengerName}>{detail.customerName}</Typography>
          <View style={styles.fareCol}>
            <Typography style={styles.fareLabel}>{copy.fareLabel}</Typography>
            <Typography style={styles.fareAmount}>{detail.fare}</Typography>
          </View>
        </View>

        <WorkerRouteAddresses
          pickupAddress={detail.pickupAddress}
          dropoffAddress={detail.dropoffAddress}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Typography style={styles.statLabel}>Distance</Typography>
            <Typography style={styles.statValue}>{detail.distance}</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Typography style={styles.statLabel}>ETA</Typography>
            <Typography style={styles.statValue}>{detail.eta}</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Typography style={styles.statLabel}>{detail.payment}</Typography>
            <Typography style={styles.statValue}>{detail.fare}</Typography>
          </View>
        </View>

        <Button title={copy.acceptButton} onPress={accept} style={styles.acceptBtn} />
        <Pressable onPress={onBack} style={styles.rejectBtn}>
          <Typography style={styles.rejectTxt}>Reject</Typography>
        </Pressable>
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  paymentBadge: {
    alignSelf: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentTxt: {
    color: COLORS.APP_SECONDARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  passengerName: {
    flex: 1,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
  fareAmount: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    paddingVertical: 14,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.APP_LINE,
  },
  statLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
  statValue: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginTop: 4,
  },
  acceptBtn: {
    marginTop: 8,
    backgroundColor: COLORS.SECONDARY,
  },
  rejectBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  rejectTxt: {
    color: COLORS.ERROR,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
});
