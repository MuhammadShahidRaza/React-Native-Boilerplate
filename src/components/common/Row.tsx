import { StyleSheet, TouchableOpacity } from 'react-native';
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
  ...restProps
}: Props) => {
  const { isLangRTL } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={onPress ? false : true}
      activeOpacity={onPress ? 0.5 : 1}
      style={[
        styles.row,
        { flexDirection: isLangRTL ? 'row-reverse' : 'row' },
        isRightLeftJustify && {
          justifyContent: isLangRTL ? 'flex-start' : 'flex-end',
        },
        style,
      ]}
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
