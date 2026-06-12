import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { AppGradient, AppStatusModal, Button, GradientIcon, Map, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS, screenHeight, formatMoney } from 'utils/index';
import { parseWalletBalance, WORKER_WALLET_TOP_OFF } from 'utils/workerOnboarding';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { setWorkerOnline } from 'store/slices/worker';
import { getMapVehicleMarkerKind, getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { getCurrentLocation } from 'utils/location';
import { updateUserLocation } from 'api/functions/app/user';
import { updateWorkerFirestoreLocation } from 'services/location/workerLocation';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import { getWorkerWalletSummary } from 'api/functions/snlift/wallet';
import { useCurrentLocation } from 'hooks/useCurrentLocation';

function formatRating(user: { details?: Record<string, unknown> } | null | undefined): string {
  const d = user?.details;
  const raw =
    d?.average_rating ??
    d?.avg_rating ??
    d?.rating ??
    (user as { average_rating?: number | string } | null)?.average_rating;
  if (raw === undefined || raw === null || raw === '') return '—';
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  return Number.isNaN(n) ? '—' : n.toFixed(1);
}

export const WorkerHomeScreen = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const userDetails = useAppSelector(state => state?.user?.userDetails);
  const role = useAppSelector(state => state?.user?.role);
  const { isOnline } = useAppSelector(state => state.worker);
  const copy = getWorkerRoleCopy(role);
  const { loadCurrentLocation } = useCurrentLocation();
  const [topOffVisible, setTopOffVisible] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(formatMoney(0));
  const [tripCount, setTripCount] = useState('0');
  const locationUpdatedRef = useRef(false);

  const firstName = useMemo(() => {
    const full = userDetails?.full_name?.trim();
    if (full) return full.split(/\s+/)[0];
    return 'there';
  }, [userDetails?.full_name]);

  const ratingLabel = useMemo(() => formatRating(userDetails), [userDetails]);
  const walletBalance = useMemo(() => parseWalletBalance(userDetails), [userDetails]);
  const walletFunded = walletBalance > 0;

  const statusText = isOnline ? copy.onlineStatus : copy.offlineStatus;

  const loadWorkerStats = useCallback(async () => {
    if (!role) return;
    const [summary, bookingsRes] = await Promise.all([
      getWorkerWalletSummary(role),
      listBookings({ status: 'completed' }, role),
    ]);
    setTodayEarnings(formatMoney(summary?.today_earnings));
    const completed = extractBookingsList(bookingsRes).filter(
      b => (b.status ?? '').toLowerCase() === 'completed',
    );
    setTripCount(String(completed.length));
  }, [role]);

  useEffect(() => {
    if (!isFocused) return;
    loadWorkerStats();
  }, [isFocused, loadWorkerStats]);

  // GPS + address + sync location to API / Firestore (once per session)
  useEffect(() => {
    if (locationUpdatedRef.current || !userDetails?.id) return;
    locationUpdatedRef.current = true;
    (async () => {
      const located = await loadCurrentLocation();
      let latitude = located?.latitude;
      let longitude = located?.longitude;
      if (latitude == null || longitude == null) {
        const pos = await getCurrentLocation();
        if (!pos) return;
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
      updateUserLocation(latitude, longitude);
      updateWorkerFirestoreLocation(userDetails.id, latitude, longitude, role);
    })();
  }, [userDetails?.id, loadCurrentLocation, role]);

  const blockIfWalletEmpty = () => {
    if (walletFunded) return false;
    setTopOffVisible(true);
    return true;
  };

  const handleGoOnline = () => {
    if (blockIfWalletEmpty()) return;
    dispatch(setWorkerOnline(true));
  };

  const handleLookingPress = () => {
    if (blockIfWalletEmpty()) return;
    navigate(SCREENS.WORKER_REQUESTS);
  };

  useEffect(() => {
    if (walletFunded || !isOnline) return;
    dispatch(setWorkerOnline(false));
    setTopOffVisible(true);
  }, [walletFunded, isOnline, dispatch]);

  return (
    <View style={styles.root}>
      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          showCurrentLocation
          showCurrentLocationButton={false}
          scrollEnabled
          userLocationVehicleKind={getMapVehicleMarkerKind(role)}
        />
      </View>

      <SafeAreaView edges={['top']} style={styles.overlayTop} pointerEvents='box-none'>
        <View style={styles.topBar} pointerEvents='box-none'>
          <GradientIcon
            componentName={VARIABLES.Feather}
            iconName='bell'
            size={FontSize.MediumLarge}
            color={COLORS.WHITE}
            onPress={() => navigate(SCREENS.NOTIFICATIONS)}
          />
        </View>

        <View style={styles.togglePill}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => dispatch(setWorkerOnline(false))}
            style={[styles.toggleOption, !isOnline && styles.toggleActive]}
          >
            {!isOnline ? (
              <AppGradient
                colors={[...APP_GRADIENT_HORIZONTAL]}
                pointerEvents='none'
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Typography style={[styles.toggleTxt, !isOnline && styles.toggleActiveTxt]}>
              Offline
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoOnline}
            style={[styles.toggleOption, isOnline && styles.toggleActive]}
          >
            {isOnline ? (
              <AppGradient
                colors={[...APP_GRADIENT_HORIZONTAL]}
                pointerEvents='none'
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Typography style={[styles.toggleTxt, isOnline && styles.toggleActiveTxt]}>
              Online
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.card}>
        <View style={styles.cardInner}>
          <Typography style={styles.greet}>{`Good day, ${firstName}!`}</Typography>
          <Typography style={styles.status}>{statusText}</Typography>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>{todayEarnings}</Typography>
            <Typography style={styles.statLabel}>Today</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>{tripCount}</Typography>
            <Typography style={styles.statLabel}>{copy.tripsStatLabel}</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>{ratingLabel}</Typography>
            <Typography style={styles.statLabel}>Rating</Typography>
          </View>
        </View>
      </View>

      {isOnline ? (
        <Button
          title={copy.lookingButton}
          style={styles.lookingBtn}
          textStyle={styles.lookingBtnTxt}
          onPress={handleLookingPress}
        />
      ) : null}

      <AppStatusModal
        visible={topOffVisible}
        onClose={() => setTopOffVisible(false)}
        onPrimaryPress={() => {
          setTopOffVisible(false);
          navigate(SCREENS.CONTACT_US);
        }}
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
  mapContainer: {
    height: screenHeight(50),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    marginBottom: 4,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  map: {
    flex: 1,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 30,
    padding: 4,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleOption: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {},
  toggleTxt: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_SMALL,
    zIndex: 1,
  },
  toggleActiveTxt: {
    color: COLORS.WHITE,
  },
  card: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 24,
    paddingBottom: 16,
  },
  cardInner: {
    paddingHorizontal: 24,
  },
  greet: {
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  status: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_SMALL,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SEARCH_BAR,
    paddingHorizontal: 25,
    paddingVertical: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  statLabel: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_SMALL,
  },
  statDivider: {
    width: 2,
    height: 36,
    backgroundColor: COLORS.BORDER,
  },
  lookingBtn: {
    marginHorizontal: 25,
    marginTop: 15,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
  },
  lookingBtnTxt: {
    color: COLORS.SECONDARY,
    fontSize: FontSize.MediumLarge,
  },
});
