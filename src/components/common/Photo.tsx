import { IMAGES } from 'constants/assets';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { StyleType } from 'types/common';

interface PhotoProps extends TouchableOpacityProps {
  source: string | number | null | undefined;
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
  const imageSource = source
    ? typeof source === 'string'
      ? { uri: source }
      : source
    : IMAGES.USER;

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
      {...otherProps}
    >
      <Image
        source={imageSource}
        resizeMode={resizeMode}
        style={[styles.image, { width: size, height: size, borderRadius }, imageStyle]}
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

// import { useState } from 'react';
// import {
//   Image,
//   ImageResizeMode,
//   ImageStyle,
//   StyleProp,
//   StyleSheet,
//   TouchableOpacity,
//   TouchableOpacityProps,
//   View,
// } from 'react-native';
// import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
// import { IMAGES } from 'constants/assets';
// import { StyleType } from 'types/common';

// interface PhotoProps extends TouchableOpacityProps {
//   source: string | number | null | undefined;
//   size?: number;
//   onPress?: () => void;
//   disabled?: boolean;
//   resizeMode?: ImageResizeMode;
//   borderRadius?: number;
//   containerStyle?: StyleType;
//   imageStyle?: StyleProp<ImageStyle>;
// }

// export const Photo: React.FC<PhotoProps> = ({
//   source,
//   size = 50,
//   onPress,
//   disabled = false,
//   resizeMode = 'cover',
//   borderRadius = 0,
//   containerStyle,
//   imageStyle,
//   ...otherProps
// }) => {
//   const [loading, setLoading] = useState(true);
//   const isRemoteImage = typeof source === 'string' && source.startsWith('http');
//   const imageSource =
//     typeof source === 'string'
//       ? { uri: source }
//       : typeof source === 'number'
//       ? source
//       : IMAGES.USER;

//   const handlePress = () => {
//     if (onPress) {
//       onPress();
//     }
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={onPress ? 0.5 : 1}
//       onPress={handlePress}
//       style={[styles.container, containerStyle]}
//       disabled={disabled}
//       {...otherProps}
//     >
//       <View
//         style={{
//           width: size,
//           height: size,
//           borderRadius,
//           overflow: 'hidden',
//         }}
//       >
//         {isRemoteImage && loading && (
//           <SkeletonPlaceholder borderRadius={borderRadius}>
//             <SkeletonPlaceholder.Item width={size} height={size} />
//           </SkeletonPlaceholder>
//         )}
//         <Image
//           source={imageSource}
//           resizeMode={resizeMode}
//           onLoadStart={() => setLoading(true)}
//           onLoadEnd={() => setLoading(false)}
//           style={[
//             styles.image,
//             {
//               width: size,
//               height: size,
//               borderRadius,
//               position: 'absolute',
//               opacity: loading ? 0 : 1, // hide image until loaded
//             },
//             imageStyle,
//           ]}
//         />
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   image: {},
// });
