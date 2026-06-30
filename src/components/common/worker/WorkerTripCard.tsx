import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Typography } from 'components/index';
import { getBookingStatusColor } from 'api/mappers/snliftBooking';
import { isSengoBrand } from 'constants/assets';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import type { WorkerTripRecord } from './workerMockData';

export interface WorkerTripCardProps {
  trip: WorkerTripRecord;
  onPress?: () => void;
}

export const WorkerTripCard = ({ trip, onPress }: WorkerTripCardProps) => {
  const statusColor = getBookingStatusColor(trip.status);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Typography style={styles.date}>{trip.date}</Typography>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <Typography style={[styles.statusTxt, { color: statusColor }]}>
              {trip.statusLabel}
            </Typography>
          </View>
        </View>
        <Typography style={styles.earned}>{trip.earned}</Typography>
      </View>

      <View style={styles.route}>
        <View style={styles.routeMarkers}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='location'
            size={18}
            color={COLORS.APP_SECONDARY}
          />
        </View>
        <View style={styles.routeText}>
          <Typography style={styles.routeLabel}>{trip.pickupLabel}</Typography>
          <Typography style={styles.routeAddress}>{trip.pickupAddress}</Typography>
          <Typography style={[styles.routeLabel, styles.destLabel]}>{trip.destinationLabel}</Typography>
          <Typography style={styles.routeAddress}>{trip.destinationAddress}</Typography>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Icon
            componentName={VARIABLES.Feather}
            iconName='navigation'
            size={14}
            color={COLORS.APP_TEXT_MUTED}
          />
          <Typography style={styles.metaTxt}>{trip.distance}</Typography>
        </View>
        {/* <View style={styles.metaItem}>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='star'
            size={14}
            color={COLORS.APP_STAR}
          />
          <Typography style={styles.metaTxt}>{trip.rating}</Typography>
        </View> */}
        <View style={styles.metaItem}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName={isSengoBrand() ? 'credit-card-outline' : 'cash'}
            size={14}
            color={COLORS.APP_TEXT_MUTED}
          />
          <Typography style={styles.metaTxt}>{trip.payment}</Typography>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 25,
    borderWidth: 1,
    shadowColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderColor: COLORS.APP_LINE,
    backgroundColor: COLORS.WHITE,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTxt: {
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.SemiBold,
  },
  date: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  earned: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
  },
  route: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  routeMarkers: {
    alignItems: 'center',
    width: 20,
    paddingTop: 2,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  destLabel: {
    marginTop: 10,
  },
  routeAddress: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTxt: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
});
