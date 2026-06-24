import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppGradient } from '../AppGradient';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, STYLES } from 'utils/index';
import { Photo } from '../Photo';

export type RideDriverCardVariant = 'elevatedMuted' | 'elevatedWhite';

export interface RideDriverCardProps {
  driverName: string;
  roleLabel?: string;
  rating?: string;
  avatarSource: ImageSourcePropType;
  onPhonePress: () => void;
  onMessagePress?: () => void;
  vehicleModel?: string;
  vehiclePlate?: string;
  showVehicleSection?: boolean;
  onCancelPress?: () => void;
  variant?: RideDriverCardVariant;
}

export const RideDriverCard = ({
  driverName,
  roleLabel,
  rating,
  avatarSource,
  onPhonePress,
  onMessagePress,
  vehicleModel,
  vehiclePlate,
  showVehicleSection = true,
  onCancelPress,
  variant = 'elevatedMuted',
}: RideDriverCardProps) => {
  const cardBg = variant === 'elevatedMuted' ? COLORS.SEARCH_BAR : '#F5F9FF';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.driverRow}>
        <Photo source={avatarSource} imageStyle={styles.avatar} />
        <View style={styles.driverInfo}>
          {roleLabel ? <Typography style={styles.roleLabel}>{roleLabel}</Typography> : null}
          <Typography style={styles.driverName}>{driverName}</Typography>
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
          ) : null}
        </View>
        <AppGradient variant='primaryLight'  style={styles.contactCircle} >
          <Icon
            componentName={VARIABLES.Feather}
            iconName='phone'
            size={16}
            color={COLORS.WHITE}
            onPress={onPhonePress}
          />
        </AppGradient>
        {onMessagePress ? (
          <TouchableOpacity
            style={[styles.contactCircle, styles.messageCircle]}
            onPress={onMessagePress}
          >
            <Icon
              componentName={VARIABLES.Feather}
              iconName='mail'
              size={16}
              color={COLORS.WHITE}
              onPress={onMessagePress}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {showVehicleSection && vehicleModel && vehiclePlate !== undefined ? (
        <>
          <View style={styles.cardDivider} />
          <View style={styles.carRow}>
            <View>
              <Typography style={styles.carModel}>{vehicleModel}</Typography>
              <Typography style={styles.carPlate}>{vehiclePlate}</Typography>
            </View>
            {onCancelPress ? (
              <Pressable style={styles.inlineCancelBtn} onPress={onCancelPress}>
                <Typography style={styles.inlineCancelTxt}>Cancel</Typography>
              </Pressable>
            ) : (
              <View />
            )}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  driverInfo: { flex: 1 },
  roleLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  driverName: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
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
    // opacity: 0.85,
  },
  cardDivider: {
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 7,
  },
  carRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carModel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  carPlate: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
  },
  inlineCancelBtn: {
    ...STYLES.SHADOW,
    backgroundColor: COLORS.APP_DANGER_BG,
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inlineCancelTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.Small,
  },
});
