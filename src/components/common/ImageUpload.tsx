import { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon, Photo, Typography } from 'components/index';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { FontSize } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { SelectedMedia, useMediaPicker } from 'hooks/useMediaPicker';
import { openCameraOrGallery } from 'utils/helpers/functions';
import { ImageFullScreenModal } from './ImageFullScreenModal';

type ImageSource = string | number;

interface ImageUploadProps {
  label?: string;
  title?: string;
  onImageSelected?: (image: SelectedMedia | null) => void;
  selectedImage?: string | null;
  height?: number;
  width?: number;
  showImage?: boolean;
  multiple?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  /** When true, shows Replace/Remove options when image exists (like MultipleImageUpload) */
  showReplaceRemoveOptions?: boolean;
  /** When provided, tap opens full-screen modal (useful when disabled/view mode) */
  fullScreenImages?: ImageSource[];
  /** Index to show first when opening full screen (default 0) */
  fullScreenInitialIndex?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  title,
  onImageSelected,
  selectedImage,
  height = screenHeight(20),
  width = screenWidth(90),
  showImage = true,
  multiple = false,
  error,
  touched,
  disabled = false,
  showReplaceRemoveOptions = true,
  fullScreenImages,
  fullScreenInitialIndex = 0,
}) => {
  const { pickMedia } = useMediaPicker();
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const images = fullScreenImages ?? [];
  const hasFullScreen = images.length > 0 && disabled;

  const handlePickImage = useCallback(() => {
    if (disabled) return;
    openCameraOrGallery({
      cameraPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'camera',
          multiple,
          width,
          height,
          cropping: true,
        }).then(media => {
          if (media?.length > 0 && onImageSelected) {
            onImageSelected(media[0]);
          }
        });
      },
      galleryPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'gallery',
          multiple,
          width,
          height,
          cropping: true,
        }).then(media => {
          if (media?.length > 0 && onImageSelected) {
            onImageSelected(media[0]);
          }
        });
      },
    });
  }, [disabled, multiple, width, height, onImageSelected, pickMedia]);

  const handleRemove = useCallback(() => {
    if (disabled) return;
    onImageSelected?.(null);
  }, [disabled, onImageSelected]);

  const handleImagePress = useCallback(() => {
    if (hasFullScreen) {
      setFullScreenVisible(true);
      return;
    }
    if (disabled) return;
    const hasImage = !!selectedImage;
    if (hasImage && showReplaceRemoveOptions) {
      Alert.alert('Image Options', 'What would you like to do?', [
        { text: 'Replace', onPress: handlePickImage },
        { text: 'Remove', onPress: handleRemove, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      handlePickImage();
    }
  }, [
    disabled,
    hasFullScreen,
    selectedImage,
    showReplaceRemoveOptions,
    handlePickImage,
    handleRemove,
  ]);

  const displayImage = selectedImage;
  const isErrorShown = touched && error;

  return (
    <View style={styles.container}>
      {title && <Typography style={styles.label}>{title}</Typography>}
      <TouchableOpacity
        disabled={disabled && !hasFullScreen}
        style={[
          styles.uploadContainer,
          { height, width, borderColor: isErrorShown ? COLORS.RED : COLORS.BORDER, borderWidth: 1 },
        ]}
        onPress={handleImagePress}
        activeOpacity={0.7}
      >
        {displayImage && showImage ? (
          <View style={styles.imageContainer}>
            <Photo
              source={displayImage}
              imageStyle={[styles.image, { height, width }]}
              resizeMode={disabled ? 'contain' : 'cover'}
              onPress={hasFullScreen ? () => setFullScreenVisible(true) : undefined}
              pointerEvents={hasFullScreen ? 'auto' : 'none'}
            />
            {showReplaceRemoveOptions && !disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemove}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  componentName={VARIABLES.MaterialIcons}
                  iconName='close'
                  size={20}
                  color={COLORS.WHITE}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon
              componentName={VARIABLES.MaterialIcons}
              iconName='upload-file'
              size={40}
              color={COLORS.PLACEHOLDER}
            />
            {label && (
              <Typography style={styles.placeholderText} color={COLORS.PLACEHOLDER}>
                {label}
              </Typography>
            )}
          </View>
        )}
      </TouchableOpacity>
      {isErrorShown && <Typography style={styles.error}>{error}</Typography>}
      {hasFullScreen && (
        <ImageFullScreenModal
          visible={fullScreenVisible}
          onClose={() => setFullScreenVisible(false)}
          images={images}
          initialIndex={Math.min(fullScreenInitialIndex, images.length - 1)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    color: COLORS.ICONS,
    fontSize: FontSize.MediumSmall,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
    marginTop: 5,
    fontSize: FontSize.Small,
  },
  uploadContainer: {
    borderRadius: 10,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    color: COLORS.ICONS,
    textAlign: 'center',
  },
});
