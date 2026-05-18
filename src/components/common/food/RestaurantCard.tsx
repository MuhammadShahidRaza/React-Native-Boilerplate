import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Photo } from '../Photo';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import type { RestaurantItem } from './foodRestaurants';

export interface RestaurantCardProps {
  restaurant: RestaurantItem;
  isLiked: boolean;
  onPress: () => void;
  onToggleLike: () => void;
}

export const RestaurantCard = ({ restaurant, isLiked, onPress, onToggleLike }: RestaurantCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.imgWrap}>
      <Photo source={restaurant.image} imageStyle={styles.restImg} resizeMode='cover' />
      {restaurant.featured ? (
        <View style={styles.featured} pointerEvents='none'>
          <Typography style={styles.featuredTxt}>Featured</Typography>
        </View>
      ) : null}
      <Pressable
        style={[styles.heart, isLiked && styles.heartLiked]}
        onPress={e => {
          e.stopPropagation?.();
          onToggleLike();
        }}
        hitSlop={10}
      >
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName={isLiked ? 'heart' : 'heart-outline'}
          size={FontSize.Medium}
          color={isLiked ? COLORS.APP_DANGER_TEXT : COLORS.WHITE}
        />
      </Pressable>
      <View style={styles.timeBadge} pointerEvents='none'>
        <Icon
          componentName={VARIABLES.Feather}
          iconName='clock'
          size={FontSize.ExtraSmall}
          color={COLORS.APP_TEXT}
        />
        <Typography style={styles.timeTxt}>{restaurant.time}</Typography>
      </View>
    </View>
    <View style={styles.body}>
      <View style={styles.rowBetween}>
        <Typography style={styles.name}>{restaurant.name}</Typography>
        <View style={styles.rating}>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='star'
            size={FontSize.ExtraSmall}
            color={COLORS.APP_STAR}
          />
          <Typography style={styles.ratingTxt}>4.9</Typography>
        </View>
      </View>
      <Typography style={styles.cuisine}>{restaurant.cuisine}</Typography>
      <View style={styles.feeRow}>
        <Icon
          componentName={VARIABLES.Feather}
          iconName='navigation'
          size={FontSize.ExtraSmall}
          color={COLORS.APP_TEXT_MUTED}
        />
        <Typography style={styles.fee}>{`${restaurant.fee} Delivery`}</Typography>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
  },
  imgWrap: {
    height: 140,
    backgroundColor: COLORS.APP_MAP_BG,
  },
  restImg: {
    width: '100%',
    height: '100%',
  },
  featured: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.APP_PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredTxt: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.Bold,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 2,
  },
  heartLiked: {
    backgroundColor: COLORS.WHITE,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTxt: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT,
  },
  body: {
    padding: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
    color: COLORS.APP_TEXT,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingTxt: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  cuisine: {
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
    fontSize: FontSize.Small,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fee: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
});
