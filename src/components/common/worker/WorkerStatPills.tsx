import { StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export type WorkerStatPill = {
  value: string;
  label: string;
};

export interface WorkerStatPillsProps {
  stats: readonly WorkerStatPill[];
}

export const WorkerStatPills = ({ stats }: WorkerStatPillsProps) => (
  <View style={styles.row}>
    {stats.map((stat, index) => (
      <View
        key={stat.label}
        style={[styles.pill, index < stats.length - 1 && styles.pillGap]}
      >
        <Typography style={styles.value}>{stat.value}</Typography>
        <Typography style={styles.label}>{stat.label}</Typography>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginBottom: 16,
    gap: 10,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.APP_PRIMARY,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
    
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
  },
  pillGap: {},
  value: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  label: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
    textAlign: 'center',
  },
});
