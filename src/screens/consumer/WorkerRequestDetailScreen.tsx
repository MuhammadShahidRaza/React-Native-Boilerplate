import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, screenHeight } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import {
  formatWorkerServiceType,
  getWorkerRequestDetail,
} from 'components/common/worker/workerMockData';

const AVATAR_SIZE = 56;

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

export const WorkerRequestDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_REQUEST_DETAIL>>();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const detail = useMemo(
    () => getWorkerRequestDetail(route.params?.requestId ?? '1'),
    [route.params?.requestId],
  );
  const [timerActive, setTimerActive] = useState(true);
  const hasAcceptedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      hasAcceptedRef.current = false;
      setTimerActive(true);
      return () => setTimerActive(false);
    }, []),
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigate(SCREENS.WORKER_REQUESTS);
  };

  const handleTimerExpire = () => {
    if (hasAcceptedRef.current) return;
    handleBack();
  };

  const accept = () => {
    hasAcceptedRef.current = true;
    setTimerActive(false);
    navigate(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId: detail.id,
      phase: 'pickup',
    });
  };

  return (
    <Wrapper
      useScrollView={false}
      showBackButton={false}
      backgroundColor={COLORS.TRANSPARENT}
      darkMode={false}
    >
      <View style={styles.content} pointerEvents='box-none'>
        {timerActive ? (
          <View style={styles.timerWrap} pointerEvents='none'>
            <WorkerRequestTimer seconds={60} onExpire={handleTimerExpire} active={timerActive} />
          </View>
        ) : null}

        <View style={styles.sheet} pointerEvents='box-none'>
          <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
            <Typography style={styles.backTxt} pointerEvents='none'>
              Back
            </Typography>
          </Pressable>
          <View pointerEvents='auto'>
            <Typography style={styles.screenTitle}>{copy.requestDetailTitle}</Typography>

            <View style={styles.paymentBadge}>
              <Typography style={styles.paymentTxt}>{detail.payment}</Typography>
            </View>
          </View>

          <View style={styles.sheetBody} pointerEvents='auto'>
            <View style={[styles.passengerCard, CARD_SHADOW]}>
              <Photo
                source={IMAGES.USER}
                size={AVATAR_SIZE}
                borderRadius={AVATAR_SIZE / 2}
                containerStyle={styles.avatarWrap}
              />
              <View style={styles.passengerInfo}>
                <Typography style={styles.passengerName}>{detail.customerName}</Typography>
                <Typography style={styles.serviceType}>
                  {formatWorkerServiceType(detail.serviceType)}
                </Typography>
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
            <Pressable onPress={handleBack} style={styles.rejectBtn}>
              <Typography style={styles.rejectTxt}>Reject</Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 2,
    left: 20,
    zIndex: 20,
    elevation: 20,
    paddingVertical: 8,
    paddingRight: 16,
  },
  backTxt: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  screenTitle: {
    // flex: 1,
    textAlign: 'center',
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.BLACK,
  },
  paymentBadge: {
    alignSelf: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 8,
  },
  paymentTxt: {
    color: COLORS.APP_SECONDARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },

  sheet: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 80,
    ...CARD_SHADOW,
    marginTop: screenHeight(8),
    paddingBottom: 100,
    overflow: 'visible',
  },
  timerWrap: {
    position: 'absolute',
    top: 20,
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
    backgroundColor: '#F5F9FF',
    borderRadius: 20,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: COLORS.APP_LINE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
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
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
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
    marginTop: 10,
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
    fontSize: FontSize.MediumLarge,
    color: COLORS.BLACK,
  },
  acceptBtn: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#21409A',
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
