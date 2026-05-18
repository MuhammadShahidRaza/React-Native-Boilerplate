import { StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, STYLES } from 'utils/index';

export interface ParcelTrackingBadgeProps {
  trackingId: string;
}

export const ParcelTrackingBadge = ({ trackingId }: ParcelTrackingBadgeProps) => (
  <View style={styles.badge}>
    <Typography translate={false} style={styles.badgeTxt}>
      {`Tracking ID: ${trackingId ?? ''}`}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    ...STYLES.SHADOW,
  },
  badgeTxt: {
    color: COLORS.APP_PRIMARY_DARK,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.SemiBold,
  },
});
