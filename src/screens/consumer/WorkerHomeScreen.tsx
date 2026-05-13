import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map } from 'components/index';
import { Typography, RowComponent } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';

export const WorkerHomeScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const userDetails = useAppSelector(state => state?.user?.userDetails);
  const firstName = userDetails?.full_name?.split(' ')?.[0] ?? 'Alex';

  return (
    <View style={styles.root}>
      {/* Map fills screen */}
      <Map
        style={styles.map}
        showCurrentLocation
        showCurrentLocationButton={false}
        scrollEnabled={true}
      />

      {/* Offline / Online toggle — floats over map */}
      <SafeAreaView edges={['top']} style={styles.overlayTop} pointerEvents="box-none">
        <View style={styles.togglePill}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsOnline(false)}
            style={[styles.toggleOption, !isOnline && styles.toggleActive]}
          >
            {!isOnline ? (
              <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
            ) : null}
            <Typography style={[styles.toggleTxt, !isOnline && styles.toggleActiveTxt]}>
              Offline
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsOnline(true)}
            style={[styles.toggleOption, isOnline && styles.toggleActive]}
          >
            {isOnline ? (
              <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
            ) : null}
            <Typography style={[styles.toggleTxt, isOnline && styles.toggleActiveTxt]}>
              Online
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom info card */}
      <View style={styles.card}>
        <Typography style={styles.greet}>Good day, {firstName}!</Typography>
        <Typography style={styles.status}>{isOnline ? "You're online" : "You're offline"}</Typography>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>CFA 87.50</Typography>
            <Typography style={styles.statLabel}>Earning</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>12</Typography>
            <Typography style={styles.statLabel}>Rides</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Typography style={styles.statValue}>4.9</Typography>
            <Typography style={styles.statLabel}>Rating</Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.APP_MAP_BG,
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
  toggleActive: {
    // gradient applied via LinearGradient child
  },
  toggleTxt: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
  },
  toggleActiveTxt: {
    color: COLORS.WHITE,
  },
  card: {
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greet: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  status: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  statLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.BORDER,
  },
});
