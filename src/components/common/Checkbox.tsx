import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { RowComponent } from './Row';

interface CheckboxProps {
  label?: string;
  color?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  checkboxStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  extraLabel?: React.ReactNode;
  accessibilityLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  onPress,
  style,
  checkboxStyle,
  color = COLORS.PRIMARY,
  extraLabel,
  labelStyle,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    onChange(!checked);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
    >
      <RowComponent style={[styles.container, style]}>
        <View
          style={[
            {
              ...styles.checkbox,
              borderColor: color,
              backgroundColor: checked ? color : 'transparent',
            },
            checkboxStyle,
          ]}
        >
          {checked && (
            <Icon
              componentName={VARIABLES.AntDesign}
              iconName={'check'}
              color={checked ? COLORS.WHITE : color}
            />
          )}
        </View>
        {extraLabel}
        <Typography style={[styles.label, labelStyle]}>{label}</Typography>
      </RowComponent>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.GAP_15,
    justifyContent: 'flex-start',
    width: '90%',
  },
  checkbox: {
    ...FLEX_CENTER,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  label: {
    fontSize: FontSize.MediumSmall,
  },
});
