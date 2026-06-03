import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CommonProps } from 'types/index';
import { FLEX_BETWEEN } from 'utils/index';
import { useTranslation } from 'hooks/index';

interface Props extends CommonProps {
  onPress?: () => void;
  isRightLeftJustify?: boolean;
  activeOpacity?: number;
  hitSlop?: number;
}
export const RowComponent = ({
  children,
  style,
  onPress,
  hitSlop,
  isRightLeftJustify = false,
  activeOpacity = 0.5,
  ...restProps
}: Props) => {
  const { isLangRTL } = useTranslation();
  const rowStyle: StyleProp<ViewStyle> = [
    styles.row,
    { flexDirection: isLangRTL ? 'row-reverse' : 'row' },
    isRightLeftJustify
      ? { justifyContent: isLangRTL ? 'flex-start' : 'flex-end' }
      : undefined,
    style,
  ];

  if (!onPress) {
    return (
      <View style={rowStyle} {...restProps}>
        {children}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={rowStyle}
      hitSlop={hitSlop}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: FLEX_BETWEEN,
});
