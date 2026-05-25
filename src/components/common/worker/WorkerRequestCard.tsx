import { Pressable, StyleSheet, View } from 'react-native';
import { Photo, Typography } from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { formatWorkerServiceType, type WorkerRequestRecord } from './workerMockData';

export interface WorkerRequestCardProps {
  request: WorkerRequestRecord;
  fareLabel: string;
  onPress?: () => void;
}

const AVATAR_SIZE = 56;

export const WorkerRequestCard = ({ request, fareLabel, onPress }: WorkerRequestCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <Photo
      source={IMAGES.USER_IMAGE}
      size={AVATAR_SIZE}
      imageStyle={{ tintColor: COLORS.SECONDARY , borderRadius: 50, borderWidth: 2, borderColor: COLORS.APP_LINE}} // add border radius to the image
      containerStyle={styles.avatarWrap}
    />
    <View style={styles.infoCol}>
      <Typography style={styles.name} numberOfLines={1}>
        {request.customerName}
      </Typography>
      <Typography style={styles.serviceType}>
        {formatWorkerServiceType(request.serviceType)}
      </Typography>
    </View>
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
    backgroundColor: '#F5F9FF',
    borderRadius: 30,
    padding: 10,
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
  avatarWrap: {
    overflow: 'hidden',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  serviceType: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    alignSelf: 'flex-start',
    color: COLORS.APP_TEXT_MUTED,
  },
  fareAmount: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
    marginTop: 2,
  },
});
