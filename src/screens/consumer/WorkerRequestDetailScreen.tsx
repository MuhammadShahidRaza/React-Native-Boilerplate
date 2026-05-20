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
import { COLORS, screenHeight } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { getWorkerRequestDetail } from 'components/common/worker/workerMockData';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

export const WorkerRequestDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_REQUEST_DETAIL>>();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const detail = useMemo(
    () => getWorkerRequestDetail(route.params?.requestId ?? '1'),
    [route.params?.requestId],
  );
  const serviceLabel = copy.jobKind === 'delivery' ? 'Parcel' : 'Ride';

  const accept = () => {
    navigate(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId: detail.id,
      phase: 'pickup',
    });
  };

  return (
    <Wrapper useScrollView={false}
    
    headerTitle={copy.requestDetailTitle}
    showBackButton={false}
   
    
    backgroundColor={COLORS.LIGHT_GREY} darkMode={false}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Typography style={styles.backTxt}>Back</Typography>
        </Pressable>
      </View>
      <View style={styles.timerWrap}>
            <WorkerRequestTimer seconds={60} onExpire={onBack} />
          </View>
     

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
     
        <View style={styles.sheet}>
          
          <Typography style={styles.screenTitle}>{copy.requestDetailTitle}</Typography>
      
          <View style={styles.paymentBadge}>
        <Typography style={styles.paymentTxt}>{detail.payment}</Typography>
      </View>
          <View style={styles.sheetBody}>
            <View style={[styles.passengerCard, CARD_SHADOW]}>
              <Photo source={IMAGES.USER} size={52} borderRadius={26} />
              <View style={styles.passengerInfo}>
                <Typography style={styles.passengerName}>{detail.customerName}</Typography>
                <Typography style={styles.serviceType}>{serviceLabel}</Typography>
              </View>
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
                <Typography style={styles.statValue}>{detail.distance}</Typography>
                <Typography style={styles.statLabel}>Distance</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Typography style={styles.statValue}>{detail.eta}</Typography>
                <Typography style={styles.statLabel}>ETA</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Typography style={styles.statValue}>{detail.fare}</Typography>
                <Typography style={styles.statLabel}>{detail.payment}</Typography>
              </View>
            </View>

            <Button title={copy.acceptButton} onPress={accept} style={styles.acceptBtn} />
            <Pressable onPress={onBack} style={styles.rejectBtn}>
              <Typography style={styles.rejectTxt}>Reject</Typography>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backTxt: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
    minWidth: 48,
  },
  screenTitle: {
    // flex: 1,
    textAlign: 'center',
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    paddingTop: 16,
    color: COLORS.APP_TEXT,
  },
  topBarSpacer: {
    minWidth: 48,
  },
  paymentBadge: {
    alignSelf: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  paymentTxt: {
    color: COLORS.APP_SECONDARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    ...CARD_SHADOW,
    marginTop:screenHeight(28),
    paddingBottom: 100,
  },
  timerWrap: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  sheetBody: {
    paddingHorizontal: 16,
    gap: 14,
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
  passengerInfo: {
    flex: 1,
    gap: 2,
  },
  passengerName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  serviceType: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
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
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 14,
    paddingVertical: 14,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.APP_LINE,
  },
  statValue: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  statLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
  acceptBtn: {
    marginTop: 4,
    backgroundColor: COLORS.SECONDARY,
  },
  rejectBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rejectTxt: {
    color: COLORS.ERROR,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
});
