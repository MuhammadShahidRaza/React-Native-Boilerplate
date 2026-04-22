import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { NumberProp, SvgProps } from 'react-native-svg';
import { ChildrenType, StyleType } from 'types/common';

interface SvgComponentProps extends TouchableOpacityProps {
  Svg: React.FC<SvgProps>;
  svgWidth?: NumberProp;
  svgHeight?: NumberProp;
  onPress?: () => void;
  clickable?: boolean;
  borderRadius?: number;
  containerStyle?: StyleType;
  children?: ChildrenType;
  fill?: string;
  stroke?: string;
}

export const SvgComponent: React.FC<SvgComponentProps> = ({
  Svg,
  onPress,
  svgWidth,
  svgHeight,
  children,
  clickable = false,
  borderRadius = 0,
  containerStyle,
  fill,
  stroke,
  ...otherProps
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      disabled={!clickable}
      {...otherProps}
    >
      <Svg
        {...(svgWidth !== undefined && { width: svgWidth })}
        {...(svgHeight !== undefined && { height: svgHeight })}
        {...(fill !== undefined && { fill: fill })}
        {...(stroke !== undefined && { stroke: stroke })}
      />
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  svg: {},
});
