import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { AppGradient } from '../AppGradient';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface ParcelCourierCardProps {
  courierName: string;
  phone: string;
  avatarSource: ImageSourcePropType;
  rating?: string;
  onPhonePress: () => void;
  onMessagePress: () => void;
}

export const ParcelCourierCard = ({
  courierName,
  phone,
  avatarSource,
  rating,
  onPhonePress,
  onMessagePress,
}: ParcelCourierCardProps) => (
  <View style={styles.card}>
    <Image source={avatarSource} style={styles.avatar} />
    <View style={styles.info}>
      <Typography style={styles.name}>{courierName}</Typography>
      {rating ? (
        <View style={styles.ratingRow}>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='star'
            size={FontSize.Small}
            color={COLORS.APP_STAR}
          />
          <Typography style={styles.rating}>{rating}</Typography>
        </View>
      ) : (
        <Typography style={styles.phone}>{phone}</Typography>
      )}
    </View>
    <AppGradient variant='primaryLight' style={styles.contactCircle}>
      <Icon
        componentName={VARIABLES.Feather}
        iconName='phone'
        size={16}
        color={COLORS.WHITE}
        onPress={onPhonePress}
      />
    </AppGradient>
    <View style={[styles.contactCircle, styles.messageCircle]}>
      <Icon
        componentName={VARIABLES.Feather}
        iconName='mail'
        size={16}
        color={COLORS.WHITE}
        onPress={onMessagePress}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SEARCH_BAR,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  info: { flex: 1 },
  name: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.MediumSmall,
  },
  phone: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  contactCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageCircle: {
    backgroundColor: COLORS.APP_SECONDARY,
    marginLeft: 8,
  },
});
