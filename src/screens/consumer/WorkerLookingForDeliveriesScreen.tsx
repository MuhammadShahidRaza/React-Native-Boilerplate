import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Map, Typography } from 'components/index';
import { useAppDispatch } from 'types/reduxTypes';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight } from 'utils/index';
import { onBack } from 'navigation/index';
import { setLookingForDeliveries } from 'store/slices/worker';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';

export const WorkerLookingForDeliveriesScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dispatch(setLookingForDeliveries(true));
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      dispatch(setLookingForDeliveries(false));
    };
  }, [dispatch, pulse]);

  const stopLooking = () => {
    dispatch(setLookingForDeliveries(false));
    onBack();
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        <Map style={styles.map} showCurrentLocation showCurrentLocationButton={false} />
      </View>

      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents='box-none'>
        <Typography style={styles.topTitle}>{copy.lookingButton}</Typography>
      </SafeAreaView>

      <View style={styles.bottomCard}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]}>
          <View style={styles.pulseCore} />
        </Animated.View>
        <Typography style={styles.statusTitle}>Searching nearby requests…</Typography>
        <Typography style={styles.statusSub}>
          {copy.jobKind === 'ride'
            ? 'Stay on this screen while we match you with nearby ride requests.'
            : 'Stay on this screen while we match you with nearby delivery requests.'}
        </Typography>
        <Button
          title='Stop looking'
          onPress={stopLooking}
          style={styles.stopBtn}
          textStyle={styles.stopBtnTxt}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  mapWrap: {
    height: screenHeight(58),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 8,
  },
  topTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomCard: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: 'center',
  },
  pulseRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pulseCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.APP_PRIMARY,
  },
  statusTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  statusSub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  stopBtn: {
    width: '100%',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_PRIMARY,
  },
  stopBtnTxt: {
    color: COLORS.APP_PRIMARY,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
  },
});
