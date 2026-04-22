import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ModalComponent } from '../common/Modal';
import { Typography } from '../common/Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { Button } from '../common/Button';
import { screenHeight } from 'utils/helpers';
import { Icon } from '../common/Icon';
import { VARIABLES } from 'constants/common';
import { Booking } from 'types/responseTypes';
import { SelectedMedia, useMediaPicker } from 'hooks/useMediaPicker';
import { openCameraOrGallery } from 'utils/helpers/functions';

interface VerificationPictureModalProps {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  item: Booking;
  onConfirm: (image: SelectedMedia) => void;
}

export const VerificationPictureModal: React.FC<VerificationPictureModalProps> = ({
  isVisible,
  setIsVisible,
  onConfirm,
}) => {
  const [selectedImage, setSelectedImage] = useState<SelectedMedia | null>(null);
  const { pickMedia } = useMediaPicker();

  const handleImagePick = () => {
    openCameraOrGallery({
      cameraPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'camera',
          cropping: false,
        }).then(media => {
          if (media && media.length > 0) {
            setSelectedImage(media?.[0]);
          }
        });
      },
      galleryPress: () => {
        pickMedia({
          mediaType: 'image',
          source: 'gallery',
          cropping: false,
        }).then(media => {
          if (media && media.length > 0) {
            setSelectedImage(media?.[0]);
          }
        });
      },
    });
  };

  const handleSubmit = () => {
    if (selectedImage) {
      onConfirm(selectedImage);
      setIsVisible(false);
      setSelectedImage(null);
    }
  };

  return (
    <ModalComponent
      modalVisible={isVisible}
      setModalVisible={setIsVisible}
      position='center'
      wantToCloseOnTop={true}
      wantToCloseOnBack={true}
      closeIcon={true}
    >
      <View style={styles.container}>
        <Typography style={styles.titleText}>Picture for Verification</Typography>
        <Typography style={styles.instructionText}>
          Once User approve the verification then job will be completed
        </Typography>

        <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7} onPress={handleImagePick}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage?.uri }}
              style={styles.uploadedImage}
              resizeMode='cover'
            />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Icon
                componentName={VARIABLES.MaterialIcons}
                iconName='upload-file'
                size={50}
                color={COLORS.PLACEHOLDER}
              />
              <Typography style={styles.uploadText}>Upload Picture</Typography>
            </View>
          )}
        </TouchableOpacity>

        <Button
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
          title='Submit Picture'
          onPress={handleSubmit}
          disabled={!selectedImage}
        />
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 15,
    paddingVertical: 10,
    width: '100%',
  },
  titleText: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  uploadArea: {
    width: '100%',
    height: screenHeight(25),
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.INPUT_BACKGROUND,
    // marginVertical: 15,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadText: {
    fontSize: FontSize.Medium,
    color: COLORS.PLACEHOLDER,
    marginTop: 5,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  submitButton: {
    width: '100%',
  },
  submitButtonText: {},
});
