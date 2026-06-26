import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
  Button,
  Photo,
  Typography,
  WorkerRouteAddresses,
  WorkerRequestDetailSkeleton,
  WorkerRequestTimer,
  Wrapper,
} from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { navigate, resetToHomeAndScreen } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, screenHeight } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { formatWorkerServiceType } from 'components/common/worker/workerMockData';
import { acceptBooking, rejectBooking } from 'api/functions/snlift/bookings';
import { getBookingStatusLabel } from 'api/mappers/snliftBooking';
import { showToast } from 'utils/toast';
import { ENV_CONSTANTS } from 'constants/common';
import { useJobDisplayTimer } from 'hooks/useJobDisplayTimer';
import { useWorkerRequestDetail } from 'hooks/useWorkerRequestDetail';
import { startWorkerActiveJobTracking } from 'services/location/workerActiveJobTracking';
import {
  isWorkerActiveJob,
  isWorkerRequestPending,
  isWorkerTerminalBookingStatus,
  workerJobNavigationPhase,
} from 'utils/workerBookingNavigation';
import { normalizeBookingStatus } from 'utils/bookingStatuses';

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
  const userDetails = useAppSelector(state => state.user?.userDetails);
  const copy = getWorkerRoleCopy(role);
  const requestId = route.params?.requestId ?? '1';
  const { detail, loading, bookingCreatedAt, bookingStatus, setBookingStatus } =
    useWorkerRequestDetail(requestId, role);
  const { expiresAt, ready } = useJobDisplayTimer(bookingCreatedAt);
  const [timerActive, setTimerActive] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
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
    showToast({ message: 'This request has expired.' });
    handleBack();
  };

  const accept = async () => {
    if (!detail || accepting || rejecting || hasAcceptedRef.current) return;

    setAccepting(true);
    setTimerActive(false);

    const res = await acceptBooking(requestId, role, {
      showLoader: !ENV_CONSTANTS.IS_ALPHA_PHASE,
    });

    if (!res?.booking) {
      setAccepting(false);
      showToast({ message: 'Could not accept this request. Try again.' });
      if (isPending) setTimerActive(true);
      return;
    }

    hasAcceptedRef.current = true;
    setBookingStatus(normalizeBookingStatus(res.booking.status));
    if (userDetails?.id) {
      void startWorkerActiveJobTracking({
        userId: String(userDetails.id),
        role: role ?? 'driver',
        bookingId: detail.id,
      });
    }
    setAccepting(false);
    // Reset (not push) so back from the job screen goes Home, not back into this stale request.
    resetToHomeAndScreen(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId: detail.id,
      phase: 'pickup',
    });
  };

  const serviceType = detail?.serviceType;
  const isPending = isWorkerRequestPending(bookingStatus, serviceType);
  const isActiveJob = isWorkerActiveJob(bookingStatus, serviceType);
  const isTerminal = isWorkerTerminalBookingStatus(bookingStatus);

  const reject = async () => {
    if (!detail || rejecting || hasAcceptedRef.current) return;

    setRejecting(true);
    setTimerActive(false);

    const res = await rejectBooking(requestId, role, {
      showLoader: !ENV_CONSTANTS.IS_ALPHA_PHASE,
    });

    setRejecting(false);

    if (!res) {
      showToast({ message: 'Could not reject this request. Try again.' });
      if (isPending) setTimerActive(true);
      return;
    }

    showToast({ message: 'Request rejected.', isError: false });
    handleBack();
  };

  const goToJob = () => {
    if (!detail) return;
    resetToHomeAndScreen(SCREENS.WORKER_JOB_NAVIGATION, {
      requestId: detail.id,
      phase: workerJobNavigationPhase(bookingStatus, detail.serviceType),
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
        {isPending && timerActive && ready && expiresAt && !loading ? (
          <View style={styles.timerWrap} pointerEvents='none'>
            <WorkerRequestTimer
              expiresAt={expiresAt}
              onExpire={handleTimerExpire}
              active={timerActive}
            />
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
          </View>

          {loading ? (
            <WorkerRequestDetailSkeleton />
          ) : !detail ? (
            <View style={styles.sheetBody} pointerEvents='auto'>
              <Typography style={styles.terminalNote}>
                Could not load this request. Please go back and try again.
              </Typography>
              <Button title='Back' onPress={handleBack} style={styles.acceptBtn} />
            </View>
          ) : (
            <>
              <View pointerEvents='auto'>
                <View style={styles.paymentBadge}>
                  <Typography style={styles.paymentTxt}>{detail.payment}</Typography>
                </View>
                <View style={styles.statusBadge}>
                  <Typography style={styles.statusBadgeTxt}>
                    {getBookingStatusLabel(bookingStatus)}
                  </Typography>
                </View>
              </View>

              <View style={styles.sheetBody} pointerEvents='auto'>
                <View style={[styles.passengerCard, CARD_SHADOW]}>
                  <Photo
                    source={
                      detail.customerAvatar
                        ? { uri: detail.customerAvatar }
                        : IMAGES.USER
                    }
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

                {isPending ? (
                  <>
                    <Button
                      title={copy.acceptButton}
                      onPress={accept}
                      loading={accepting}
                      loadingText={copy.acceptButton}
                      disabled={rejecting}
                      style={styles.acceptBtn}
                    />
                    <Pressable
                      onPress={reject}
                      disabled={rejecting || accepting}
                      style={[
                        styles.rejectBtn,
                        (rejecting || accepting) && styles.rejectBtnDisabled,
                      ]}
                    >
                      <Typography style={styles.rejectTxt}>
                        {rejecting ? 'Rejecting…' : 'Reject'}
                      </Typography>
                    </Pressable>
                  </>
                ) : null}

                {isActiveJob ? (
                  <Button title='Continue Job' onPress={goToJob} style={styles.acceptBtn} />
                ) : null}

                {isTerminal ? (
                  <Typography style={styles.terminalNote}>
                    {bookingStatus === 'completed'
                      ? 'This job has been completed.'
                      : 'This request is no longer available.'}
                  </Typography>
                ) : null}
              </View>
            </>
          )}
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
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.APP_SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusBadgeTxt: {
    color: COLORS.APP_PRIMARY,
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
    zIndex: 2,
  },
  timerWrap: {
    position: 'absolute',
    top: screenHeight(8) - 58,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
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
  rejectBtnDisabled: {
    opacity: 0.5,
  },
  rejectTxt: {
    color: COLORS.ERROR,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  terminalNote: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
