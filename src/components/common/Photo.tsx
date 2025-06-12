import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { StyleType } from 'types/common';

interface PhotoProps extends TouchableOpacityProps {
  source: string | number;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  resizeMode?: ImageResizeMode;
  borderRadius?: number;
  containerStyle?: StyleType;
  imageStyle?: StyleProp<ImageStyle>;
}

export const Photo: React.FC<PhotoProps> = ({
  source,
  size = 50,
  onPress,
  disabled = false,
  resizeMode = 'cover',
  borderRadius = 0,
  containerStyle,
  imageStyle,
  ...otherProps
}) => {
  const imageSource =
    typeof source === 'string'
      ? {uri: source}
      : typeof source === 'number'
      ? source
      : undefined;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.5 : 1}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      disabled={disabled}
      {...otherProps}>
      <Image
        source={imageSource}
        resizeMode={resizeMode}
        style={[
          styles.image,
          {width: size, height: size, borderRadius},
          imageStyle,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {},
});
