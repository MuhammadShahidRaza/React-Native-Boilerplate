import { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import ImagePicker, { Image as ImageType } from 'react-native-image-crop-picker';

export const ImagePickerComponent: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const selectFromCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image: ImageType) => {
      if (image.path) {
        setSelectedImages([image.path]);
      }
    });
  };

  const selectFromGallerySingle = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image: ImageType) => {
      if (image.path) {
        setSelectedImages([image.path]);
      }
    });
  };

  const selectFromGalleryMultiple = () => {
    ImagePicker.openPicker({
      multiple: true,
    }).then((images: ImageType[]) => {
      const paths = images.map(image => image.path);
      setSelectedImages(paths);
    });
  };

  return (
    <View style={styles.container}>
      {selectedImages.map((image, index) => (
        <Image key={index} source={{ uri: image }} style={styles.image} />
      ))}
      <Button title='Select from Camera' onPress={selectFromCamera} />
      <Button title='Select from Gallery (Single)' onPress={selectFromGallerySingle} />
      <Button title='Select from Gallery (Multiple)' onPress={selectFromGalleryMultiple} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});
