import { useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { VARIABLES } from 'constants/common';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { FontSize } from 'types/fontTypes';

const SCREEN_WIDTH = screenWidth(100);
const SCREEN_HEIGHT = screenHeight(100);

type ImageSource = string | number;

interface ImageFullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  /** Single image (legacy) or list of images for swipe gallery */
  imageUri?: string | number | null;
  images?: ImageSource[];
  initialIndex?: number;
}

export const ImageFullScreenModal: React.FC<ImageFullScreenModalProps> = ({
  visible,
  onClose,
  imageUri,
  images: imagesProp,
  initialIndex = 0,
}) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const images: ImageSource[] = imagesProp?.length ? imagesProp : imageUri ? [imageUri] : [];

  const renderItem: ListRenderItem<ImageSource> = ({ item }) => (
    <View style={styles.slide}>
      <Photo
        source={item}
        size={SCREEN_HEIGHT}
        resizeMode='contain'
        disabled
        containerStyle={styles.photoContainer}
        imageStyle={styles.fullScreenImage}
      />
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 10 }]}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon
            componentName={VARIABLES.Entypo}
            iconName='cross'
            size={FontSize.ExtraLarge}
            color={COLORS.PRIMARY}
            iconStyle={styles.closeIcon}
          />
        </TouchableOpacity>
        {images.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={images}
            renderItem={renderItem}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(initialIndex, images.length - 1)}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  closeIcon: {},
});
