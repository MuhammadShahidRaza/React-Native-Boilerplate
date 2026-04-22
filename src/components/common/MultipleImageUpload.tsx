import { useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { Icon, Typography } from 'components/index';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { SelectedMedia, useMediaPicker } from 'hooks/useMediaPicker';
import { openCameraOrGallery } from 'utils/helpers/functions';
import { FontSize } from 'types/fontTypes';

interface MultipleImageUploadProps {
  selectedImages: SelectedMedia[];
  onImagesChange: (images: SelectedMedia[]) => void;
  maxImages?: number;
  mainUploadLabel?: string;
}

type ThumbnailItemType = 'image' | 'placeholder' | 'add';

interface ThumbnailItem {
  type: ThumbnailItemType;
  uri?: string;
  index?: number;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  selectedImages,
  onImagesChange,
  maxImages = 5,
  mainUploadLabel = 'Upload Vehicle Pictures',
}) => {
  const { pickMedia } = useMediaPicker();

  const isMaxReached = selectedImages.length >= maxImages;
  const remainingSlots = maxImages - selectedImages.length;

  // Get first image for main box
  const firstImage = selectedImages?.[0]?.uri;

  // Get remaining images (skip first one, take next 4)
  const remainingImages = selectedImages.slice(1, 5);

  // Build thumbnail list data (for images 2-5)
  const thumbnailData = useMemo<ThumbnailItem[]>(() => {
    const items: ThumbnailItem[] = [];

    // Add remaining images (images 2-5)
    remainingImages.forEach((image, index) => {
      // index + 1 because we skipped the first image
      items.push({ type: 'image', uri: image.uri, index: index + 1 });
    });

    // Add placeholder slots (up to 4 total visible in thumbnails)
    const emptySlots = Math.max(0, 4 - remainingImages.length);
    const totalImages = selectedImages.length;
    const canAddMore = totalImages < maxImages && totalImages < 5;

    // Add placeholders, but make the last one an "add" button if we can add more
    for (let i = 0; i < emptySlots; i++) {
      // Last placeholder should be add button if we can add more
      if (canAddMore && i === emptySlots - 1) {
        items.push({ type: 'add' });
      } else {
        items.push({ type: 'placeholder' });
      }
    }

    return items;
  }, [remainingImages, selectedImages.length, maxImages]);

  // Handle removing an image
  const handleRemoveImage = useCallback(
    (index: number) => {
      onImagesChange(selectedImages.filter((_, i) => i !== index));
    },
    [selectedImages, onImagesChange],
  );

  // Handle replacing an image
  const handleReplaceImage = useCallback(
    (index: number) => {
      openCameraOrGallery({
        cameraPress: () => {
          pickMedia({
            mediaType: 'image',
            source: 'camera',
            multiple: false,
            cropping: true,
          }).then(media => {
            if (media?.[0]?.uri) {
              const newImages = [...selectedImages];
              newImages[index] = media[0];
              onImagesChange(newImages);
            }
          });
        },
        galleryPress: () => {
          pickMedia({
            mediaType: 'image',
            source: 'gallery',
            multiple: false,
            cropping: true,
          }).then(media => {
            if (media?.[0]?.uri) {
              const newImages = [...selectedImages];
              newImages[index] = media[0];
              onImagesChange(newImages);
            }
          });
        },
      });
    },
    [selectedImages, onImagesChange, pickMedia],
  );

  // Handle adding new images to thumbnails
  const handleAddImages = useCallback(() => {
    if (isMaxReached) {
      Alert.alert('Maximum Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    openCameraOrGallery({
      cameraPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'camera',
          multiple: remainingSlots > 1,
          cropping: true,
        }).then(media => {
          if (media?.length > 0) {
            const newImages = media.slice(0, remainingSlots).filter(m => m?.uri);
            onImagesChange([...selectedImages, ...newImages]);
          }
        });
      },
      galleryPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'gallery',
          multiple: true,
          cropping: false,
        }).then(media => {
          if (media?.length > 0) {
            const newImages = media.slice(0, remainingSlots).filter(m => m?.uri);
            onImagesChange([...selectedImages, ...newImages]);

            if (media.length > remainingSlots) {
              Alert.alert(
                'Limit Reached',
                `Only ${remainingSlots} image(s) were added. Maximum ${maxImages} images allowed.`,
              );
            }
          }
        });
      },
    });
  }, [isMaxReached, maxImages, remainingSlots, selectedImages, onImagesChange, pickMedia]);

  // Handle adding/replacing first image in main box
  const handleMainImageAction = useCallback(() => {
    if (firstImage) {
      // If first image exists, show options to replace or remove
      Alert.alert('Image Options', 'What would you like to do?', [
        { text: 'Replace', onPress: () => handleReplaceImage(0) },
        {
          text: 'Remove',
          onPress: () => handleRemoveImage(0),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      // If no first image, add new one
      handleAddImages();
    }
  }, [firstImage, handleReplaceImage, handleRemoveImage, handleAddImages]);

  // Show image options alert
  const showImageOptions = useCallback(
    (index: number) => {
      Alert.alert('Image Options', 'What would you like to do?', [
        { text: 'Replace', onPress: () => handleReplaceImage(index) },
        {
          text: 'Remove',
          onPress: () => handleRemoveImage(index),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [handleReplaceImage, handleRemoveImage],
  );

  // Render uploaded image thumbnail
  const renderImageThumbnail = useCallback(
    (item: ThumbnailItem) => {
      if (item.type !== 'image' || !item.uri || item.index === undefined) {
        return null;
      }

      return (
        <TouchableOpacity
          style={styles.thumbnailSlot}
          activeOpacity={0.8}
          onPress={() => showImageOptions(item.index!)}
        >
          <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode='cover' />
          <TouchableOpacity
            style={styles.thumbnailRemoveButton}
            onPress={() => handleRemoveImage(item.index!)}
            activeOpacity={0.8}
          >
            <Icon
              componentName={VARIABLES.MaterialIcons}
              iconName='close'
              size={16}
              color={COLORS.WHITE}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [showImageOptions, handleRemoveImage],
  );

  // Render placeholder thumbnail
  const renderPlaceholderThumbnail = useCallback(() => {
    return (
      <TouchableOpacity
        style={styles.thumbnailPlaceholder}
        onPress={handleAddImages}
        activeOpacity={0.7}
        disabled={isMaxReached}
      >
        <Icon
          componentName={VARIABLES.MaterialIcons}
          iconName='upload-file'
          size={32}
          color={isMaxReached ? COLORS.TEXT_SECONDARY : COLORS.PLACEHOLDER}
        />
      </TouchableOpacity>
    );
  }, [handleAddImages, isMaxReached]);

  // Render add more button
  const renderAddButton = useCallback(() => {
    return (
      <TouchableOpacity style={styles.addMoreButton} onPress={handleAddImages} activeOpacity={0.7}>
        <Icon
          componentName={VARIABLES.MaterialIcons}
          iconName='add'
          size={40}
          color={COLORS.PLACEHOLDER}
        />
      </TouchableOpacity>
    );
  }, [handleAddImages]);

  // Render thumbnail item based on type
  const renderThumbnailItem = useCallback(
    ({ item }: { item: ThumbnailItem }) => {
      switch (item.type) {
        case 'image':
          return renderImageThumbnail(item);
        case 'placeholder':
          return renderPlaceholderThumbnail();
        case 'add':
          return renderAddButton();
        default:
          return null;
      }
    },
    [renderImageThumbnail, renderPlaceholderThumbnail, renderAddButton],
  );

  return (
    <View style={styles.container}>
      {/* Main Upload Card - Shows first image or upload icon */}
      <TouchableOpacity
        style={styles.mainUploadCard}
        onPress={handleMainImageAction}
        activeOpacity={0.7}
        disabled={isMaxReached && !firstImage}
      >
        {firstImage ? (
          <View style={styles.mainImageContainer}>
            <Image source={{ uri: firstImage }} style={styles.mainImage} resizeMode='cover' />
            <TouchableOpacity
              style={styles.mainImageRemoveButton}
              onPress={() => handleRemoveImage(0)}
              activeOpacity={0.8}
            >
              <Icon
                componentName={VARIABLES.MaterialIcons}
                iconName='close'
                size={20}
                color={COLORS.WHITE}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mainUploadContent}>
            <Icon
              componentName={VARIABLES.MaterialIcons}
              iconName='upload-file'
              size={48}
              color={isMaxReached ? COLORS.TEXT_SECONDARY : COLORS.PLACEHOLDER}
            />
            <Typography
              fontSize={FontSize.MediumSmall}
              style={[styles.mainUploadText, isMaxReached && styles.mainUploadTextDisabled]}
            >
              {mainUploadLabel}
            </Typography>
          </View>
        )}
      </TouchableOpacity>

      {/* Thumbnail Row - Horizontal FlatList */}
      <FlatList
        data={thumbnailData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderThumbnailItem}
        contentContainerStyle={styles.thumbnailRow}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  mainUploadCard: {
    width: '100%',
    height: screenHeight(25),
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  mainImageRemoveButton: {
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
  mainUploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mainUploadText: {
    color: COLORS.PLACEHOLDER,
    textAlign: 'center',
  },
  mainUploadTextDisabled: {
    color: COLORS.TEXT_SECONDARY,
  },
  thumbnailRow: {
    gap: 12,
    paddingRight: 12,
  },
  thumbnailSlot: {
    width: screenWidth(20),
    height: screenWidth(20),
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    // marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnailPlaceholder: {
    width: screenWidth(20),
    height: screenWidth(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 12,
  },
  addMoreButton: {
    width: screenWidth(20),
    height: screenWidth(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 12,
  },
});
