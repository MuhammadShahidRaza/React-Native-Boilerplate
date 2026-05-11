import { useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Button, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { navigate, onBack } from 'navigation/index';
import { CancelReasonModal } from './CancelReasonModal';
import { IMAGES } from 'constants/assets';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const TrackParcelScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_PARCEL>>();
  const phase = route.params?.phase ?? 'picked_up';
  const [cancelOpen, setCancelOpen] = useState(false);
  const isDelivered = phase === 'delivered';

  return (
    <Wrapper
      headerTitle="Track Parcel"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
      headerEndIcon={
        !isDelivered
          ? () => (
              <Pressable onPress={() => setCancelOpen(true)} hitSlop={12}>
                <Typography style={styles.cancelTxt}>Cancel</Typography>
              </Pressable>
            )
          : undefined
      }
    >
      <View style={styles.map} />
      <View style={styles.progressRow}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.seg, (isDelivered || i === 0) ? styles.segOn : null]}
          />
        ))}
      </View>
      <View style={styles.badge}>
        <Typography style={styles.badgeTxt}>Tracking ID: SN-PKL-2847</Typography>
      </View>

      <View style={styles.centerBlock}>
        <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.bigIcon}>
          <Icon
            componentName={VARIABLES.Feather}
            iconName="package"
            size={36}
            color={COLORS.WHITE}
          />
        </LinearGradient>
        <Typography style={styles.statusTitle}>
          {isDelivered ? 'Delivered' : 'Parcel Picked Up'}
        </Typography>
        <Typography style={styles.statusSub}>
          {isDelivered ? 'Parcel has been delivered' : 'Courier has collected your parcel'}
        </Typography>
      </View>

      <View style={styles.courierCard}>
        <Image source={IMAGES.USER} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Typography style={styles.name}>John Doe</Typography>
          <Typography style={styles.phone}>+01 000 0000 00</Typography>
        </View>
        <Pressable style={styles.iconBtn}>
          <Icon componentName={VARIABLES.Feather} iconName="phone" size={18} color={COLORS.WHITE} />
        </Pressable>
        <Pressable style={[styles.iconBtn, { backgroundColor: COLORS.APP_TINT_SOFT }]}>
          <Icon componentName={VARIABLES.Feather} iconName="mail" size={18} color={COLORS.APP_SECONDARY} />
        </Pressable>
      </View>

      {!isDelivered ? (
        <View style={styles.stats}>
          <MiniStat label="Vehicle Type" value="YAMAHA" />
          <MiniStat label="License Plate" value="AA-001-AA" />
          <MiniStat label="Color" value="Black" />
        </View>
      ) : (
        <View style={styles.rate}>
          <Typography style={styles.rateTitle}>Rate your ride</Typography>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <Icon
                key={i}
                componentName={VARIABLES.Ionicons}
                iconName="star-outline"
                size={28}
                color={COLORS.APP_STAR}
              />
            ))}
          </View>
        </View>
      )}

      {isDelivered ? (
        <Button title="Done" onPress={() => onBack()} style={styles.ctaBlue} textStyle={styles.ctaTxt} />
      ) : (
        <Pressable
          style={styles.trackSoft}
          onPress={() => navigate(SCREENS.TRACK_PARCEL, { phase: 'delivered' })}
        >
          <Typography style={styles.trackSoftTxt}>Track Delivery</Typography>
        </Pressable>
      )}

      <CancelReasonModal
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onContinue={() => setCancelOpen(false)}
      />
    </Wrapper>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.mini}>
    <Typography style={styles.miniVal}>{value}</Typography>
    <Typography style={styles.miniLbl}>{label}</Typography>
  </View>
);

const styles = StyleSheet.create({
  cancelTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  map: {
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.APP_MAP_BG,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 12,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.APP_LINE,
  },
  segOn: {
    backgroundColor: COLORS.APP_PRIMARY,
  },
  badge: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeTxt: {
    color: COLORS.APP_PRIMARY_DARK,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.Bold,
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 20,
  },
  bigIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  statusSub: {
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
    fontSize: FontSize.Small,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    backgroundColor: COLORS.APP_TINT_SOFT,
    borderRadius: 16,
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  phone: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  mini: {
    alignItems: 'center',
  },
  miniVal: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  miniLbl: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.ExtraSmall,
    marginTop: 4,
  },
  rate: {
    alignItems: 'center',
    marginTop: 24,
  },
  rateTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  ctaBlue: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: COLORS.APP_SECONDARY,
    borderRadius: 14,
  },
  ctaTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
  trackSoft: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.APP_DANGER_BG,
    alignItems: 'center',
  },
  trackSoftTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
});
