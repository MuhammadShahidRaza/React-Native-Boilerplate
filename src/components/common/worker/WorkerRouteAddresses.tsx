import { StyleSheet, View } from 'react-native';
import { Icon, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface WorkerRouteAddressesProps {
  pickupAddress: string;
  dropoffAddress: string;
}

export const WorkerRouteAddresses = ({ pickupAddress, dropoffAddress }: WorkerRouteAddressesProps) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.markers}>
        <View style={styles.pickupDot} />
        <View style={styles.line} />
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName='location'
          size={18}
          color={COLORS.APP_SECONDARY}
        />
      </View>
      <View style={styles.textCol}>
        <View>
          <Typography style={styles.label}>Pick up</Typography>
          <Typography style={styles.address}>{pickupAddress}</Typography>
        </View>
        <View style={styles.divider} />
        <View>
          <Typography style={styles.label}>Drop off</Typography>
          <Typography style={styles.address}>{dropoffAddress}</Typography>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  markers: {
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
  line: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 4,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 12,
  },
  address: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
  },
});
