import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { GradientButton } from '../GradientButton';

export interface MenuItemQuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const MenuItemQuantityControl = ({
  quantity,
  onIncrement,
  onDecrement,
}: MenuItemQuantityControlProps) => {
  if (quantity <= 0) {
    return (
      <GradientButton
        title='+ Add'
        onPress={onIncrement}
        style={styles.addBtnWrap}
        gradientStyle={styles.addBtn}
        textStyle={styles.addTxt}
      />
    );
  }

  return (
    <View style={styles.qtyControl}>
      <Pressable
        style={styles.qtyBtn}
        onPress={onDecrement}
        hitSlop={8}
        accessibilityLabel='Decrease quantity'
      >
        <Icon
          componentName={VARIABLES.Feather}
          iconName='minus'
          size={FontSize.Small}
          color={COLORS.APP_PRIMARY}
        />
      </Pressable>
      <Typography style={styles.qtyVal}>{String(quantity).padStart(2, '0')}</Typography>
      <Pressable
        style={[styles.qtyBtn, styles.qtyBtnPlus]}
        onPress={onIncrement}
        hitSlop={8}
        accessibilityLabel='Increase quantity'
      >
        <Icon
          componentName={VARIABLES.Feather}
          iconName='plus'
          size={FontSize.Small}
          color={COLORS.WHITE}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  addBtnWrap: {
    borderRadius: 10,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addTxt: {
    fontSize: FontSize.Small,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: COLORS.APP_PRIMARY_DARK,
  },
  qtyVal: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    minWidth: 24,
    textAlign: 'center',
    fontSize: FontSize.MediumSmall,
  },
});
