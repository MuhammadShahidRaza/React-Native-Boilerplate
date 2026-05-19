import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface FoodCartBarProps {
  itemCount: number;
  totalLabel: string;
  onPress: () => void;
}

export const FoodCartBar = ({ itemCount, totalLabel, onPress }: FoodCartBarProps) => {
  if (itemCount <= 0) return null;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.bar} onPress={onPress}>
        <View style={styles.left}>
          <View style={styles.badge}>
            <Typography style={styles.badgeTxt}>{String(itemCount)}</Typography>
          </View>
          <Typography style={styles.label}>View Cart</Typography>
        </View>
        <View style={styles.right}>
          <Typography style={styles.total}>{totalLabel}</Typography>
          <Icon
            componentName={VARIABLES.Feather}
            iconName='chevron-right'
            size={FontSize.Medium}
            color={COLORS.WHITE}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.APP_SECONDARY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.APP_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  label: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumSmall,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  total: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumSmall,
  },
});
