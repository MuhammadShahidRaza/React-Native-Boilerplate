import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { vehicleTypeDisplayLabel } from 'constants/vehicleTypes';

export interface RideVehicleStatItem {
  icon: string;
  label: string;
  value: string;
}

export interface RideVehicleStatsRowProps {
  items: RideVehicleStatItem[];
  showVerticalDividers?: boolean;
  marginHorizontal?: number;
  elevated?: boolean;
}

export const RideVehicleStatsRow = ({
  items,
  showVerticalDividers = false,
  marginHorizontal = 20,
  elevated = false,
}: RideVehicleStatsRowProps) => {
  const children: ReactNode[] = [];
  items.forEach((item, index) => {
    if (showVerticalDividers && index > 0) {
      children.push(
        // eslint-disable-next-line react/no-array-index-key
        <View key={`d-${index}`} style={styles.statDivider} />,
      );
    }
    children.push(<StatItem key={`${item.label}-${item.value}`} {...item} />);
  });

  return (
    <View style={[styles.statsRow, { marginHorizontal }, elevated && styles.statsRowElevated]}>
      {children}
    </View>
  );
};

const formatVehicleTypeValue = (value: string) => vehicleTypeDisplayLabel(value) || value;

const StatItem = ({ icon, label, value }: RideVehicleStatItem) => {
  const displayValue = label === 'Vehicle Type' ? formatVehicleTypeValue(value) : value;
  const displayIcon =
    label === 'Vehicle Type' && (icon === 'bicycle' || icon === 'motorbike' || icon === 'cycle')
      ? 'bike'
      : icon;

  return (
  <View style={styles.statItem}>
    <Icon
      componentName={VARIABLES.MaterialCommunityIcons}
      iconName={displayIcon}
      size={22}
      color={COLORS.APP_PRIMARY}
    />
    <Typography style={styles.statValue}>{displayValue}</Typography>
    <Typography style={styles.statLabel}>{label}</Typography>
  </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  statsRowElevated: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  statValue: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.APP_LINE,
    marginHorizontal: 4,
  },
});
