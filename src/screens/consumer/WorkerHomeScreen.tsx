import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Map, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY, screenHeight, BRAND_SECONDARY, BRAND_PRIMARY } from 'utils/index';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { setLookingForDeliveries, setWorkerOnline } from 'store/slices/worker';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';

export const WorkerHomeScreen = () => {
  const dispatch = useAppDispatch();
  const userDetails = useAppSelector(state => state?.user?.userDetails);
  const role = useAppSelector(state => state?.user?.role);
  const { isOnline } = useAppSelector(state => state.worker);
  const copy = getWorkerRoleCopy(role);
  const firstName = userDetails?.full_name?.split(' ')?.[0] ?? 'Alex';

  const statusText = isOnline ? copy.onlineStatus : copy.offlineStatus;

  const openRequests = () => {
    if (!isOnline) {
      dispatch(setWorkerOnline(true));
    }
    dispatch(setLookingForDeliveries(true));
    navigate(SCREENS.WORKER_REQUESTS);
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          showCurrentLocation
          showCurrentLocationButton={false}
          scrollEnabled
        />
      </View>

      <SafeAreaView edges={['top']} style={styles.overlayTop} pointerEvents='box-none'>
        <View style={styles.togglePill}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => dispatch(setWorkerOnline(false))}
            style={[styles.toggleOption, !isOnline && styles.toggleActive]}
          >
            {!isOnline ? (
              <LinearGradient
              colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
              start={{ x: -1, y: 0 }}
              end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Typography style={[styles.toggleTxt, !isOnline && styles.toggleActiveTxt]}>
              Offline
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => dispatch(setWorkerOnline(true))}
            style={[styles.toggleOption, isOnline && styles.toggleActive]}
          >
            {isOnline ? (
              <LinearGradient
                colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
                start={{ x: -1, y: 0 }}
              end={{ x: 1, y: 1 }}
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
            <Typography style={styles.statValue}>CFA 87.50</Typography>
            <Typography style={styles.statLabel}>Earning</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>12</Typography>
            <Typography style={styles.statLabel}>{copy.tripsStatLabel}</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>4.9</Typography>
            <Typography style={styles.statLabel}>Rating</Typography>
          </View>
        </View>
      </View>

      {isOnline ? (
        <Button
          title={copy.lookingButton}
          style={styles.lookingBtn}
          textStyle={styles.lookingBtnTxt}
          onPress={openRequests}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: screenHeight(52),
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
  },
  toggleActive: {},
  toggleTxt: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_SMALL,
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
    paddingHorizontal: 24,
    paddingVertical: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.ExtraExtraLarge,
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
    marginHorizontal: 24,
    marginTop: 25,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
  },
  lookingBtnTxt: {
    color: COLORS.SECONDARY,
    fontSize: FontSize.MediumLarge,
  },
});
