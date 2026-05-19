import { Pressable, StyleSheet, View } from 'react-native';
import { Photo, Typography } from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import type { WorkerRequestRecord } from './workerMockData';

export interface WorkerRequestCardProps {
  request: WorkerRequestRecord;
  fareLabel: string;
  onPress?: () => void;
}

export const WorkerRequestCard = ({ request, fareLabel, onPress }: WorkerRequestCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <Photo source={IMAGES.USER} size={52} borderRadius={26} />
    <Typography style={styles.name} numberOfLines={1}>
      {request.customerName}
    </Typography>
    <View style={styles.fareCol}>
      <Typography style={styles.fareLabel}>{fareLabel}</Typography>
      <Typography style={styles.fareAmount}>{request.fare}</Typography>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    flex: 1,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
  fareAmount: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
    marginTop: 2,
  },
});
