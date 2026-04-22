import { useState } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { ImageFullScreenModal } from './ImageFullScreenModal';

type ImageSource = string | number;

interface ImageWithFullScreenProps {
  /** Images to show in full-screen modal (supports swipe for multiple) */
  images: ImageSource[];
  /** Index of image to show first when opening full screen */
  initialIndex?: number;
  /** Preview content - e.g. Photo, ImageUpload, or custom view */
  children: React.ReactNode;
  /** When true, tap does nothing (e.g. when no images) */
  disabled?: boolean;
  /** activeOpacity for TouchableOpacity */
  activeOpacity?: number;
  /** Optional style for the touchable wrapper */
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps any content and opens full-screen image modal on tap.
 * Pass images array and children (the preview). No need to manage modal state in each screen.
 */
export const ImageWithFullScreen: React.FC<ImageWithFullScreenProps> = ({
  images,
  initialIndex = 0,
  children,
  disabled = false,
  activeOpacity = 1,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const hasImages = images?.length > 0;
  const canOpen = hasImages && !disabled;

  const handlePress = () => {
    if (canOpen) setModalVisible(true);
  };

  if (!hasImages) {
    return <>{children}</>;
  }

  return (
    <>
      <TouchableOpacity activeOpacity={activeOpacity} onPress={handlePress} style={style}>
        {children}
      </TouchableOpacity>
      <ImageFullScreenModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        images={images}
        initialIndex={Math.min(initialIndex, images.length - 1)}
      />
    </>
  );
};
