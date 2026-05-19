import { StyleSheet, View } from 'react-native';
import { Typography } from './Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface VehicleDetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export const VehicleDetailRow = ({ label, value, isLast }: VehicleDetailRowProps) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <Typography style={styles.label}>{label}</Typography>
    <Typography style={styles.value}>{value || '—'}</Typography>
  </View>
);

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.APP_LINE,
  },
  label: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginBottom: 6,
  },
  value: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
});
