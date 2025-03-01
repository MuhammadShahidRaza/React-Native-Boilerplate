import {Switch, ViewStyle, TextStyle, StyleSheet, View} from 'react-native';
import {FontSize} from 'types/fontTypes';
import {Typography} from './Typography';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  activeTextStyle?: TextStyle;
  inactiveTextStyle?: TextStyle;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  thumbColor?: string;
  style?: ViewStyle;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  activeText,
  inactiveText,
  activeTextStyle,
  inactiveTextStyle,
  activeTrackColor,
  inactiveTrackColor,
  thumbColor,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {inactiveText && (
        <Typography
          style={[styles.text, styles.inactiveText, inactiveTextStyle]}>
          {inactiveText}
        </Typography>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: inactiveTrackColor, true: activeTrackColor}}
        thumbColor={thumbColor}
      />
      {activeText && (
        <Typography style={[styles.text, styles.activeText, activeTextStyle]}>
          {activeText}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: FontSize.Medium,
    marginHorizontal: 5,
  },
  activeText: {
    color: 'green',
  },
  inactiveText: {
    color: 'red',
  },
});

export default CustomSwitch;
