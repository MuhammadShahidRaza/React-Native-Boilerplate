import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { AppGradient } from 'components/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FoodCartBarProps {
  itemCount: number;
  totalLabel: string;
  onPress: () => void;
}

export const FoodCartBar = ({ itemCount, totalLabel, onPress }: FoodCartBarProps) => {
  if (itemCount <= 0) return null;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 12 }]}>
      <AppGradient variant='primary' fill style={styles.gradient}>
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
      </AppGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  gradient: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTxt: {
    color: COLORS.APP_TEXT,
    fontWeight: FontWeight.Bold,
    lineHeight: 26,
    fontSize: FontSize.MediumSmall,
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
