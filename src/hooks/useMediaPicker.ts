import { useState } from 'react';
import ImagePicker, { ImageOrVideo, Options } from 'react-native-image-crop-picker';

type VideoOptions = Partial<
  Omit<Options, 'mediaType'> & {
    mediaType: 'video';
    compressVideoPreset?: 'LowQuality' | 'MediumQuality' | 'HighestQuality';
  }
>;

type ImageOptions = Partial<
  Omit<Options, 'mediaType'> & {
    mediaType: 'photo';
    cropping?: boolean;
    compressImageQuality?: number;
    cropperCircleOverlay?: boolean;
    width: number | undefined;
    height: number | undefined;
  }
>;

type MediaType = 'image' | 'video';

type SourceType = 'camera' | 'gallery';

export interface UseMediaPickerOptions {
  mediaType?: MediaType;
  source?: SourceType;
  multiple?: boolean;
  cropping?: boolean;
  width?: number;
  height?: number;
  cropperCircleOverlay?: boolean;
}

export interface SelectedMedia {
  uri: string;
  type: string;
  name: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number; // only for video
  isVideo: boolean;
}

/**
 * Hook for picking media (images/videos) from camera or gallery
 */
export function useMediaPicker() {
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickMedia = async (options?: UseMediaPickerOptions) => {
    setLoading(true);
    setError(null);
    const {
      mediaType = 'photo',
      source = 'gallery',
      multiple = false,
      cropping = false,
      width,
      height,
      cropperCircleOverlay = false,
    } = options || {};

    try {
      let config: VideoOptions | ImageOptions;

      if (mediaType === 'video') {
        config = {
          mediaType: 'video',
          multiple,
          // compressVideoPreset: 'MediumQuality',
        };
      } else {
        config = {
          mediaType: 'photo',
          cropping,
          multiple,
          cropperCircleOverlay,
          width,
          height,
          // compressImageQuality: 0.8,
          // on iOS you may want to specify includeExif: true, but beware of file size
        };
      }

      let result: ImageOrVideo | ImageOrVideo[];

      if (source === 'camera') {
        result = await ImagePicker.openCamera(config);
      } else {
        result = await ImagePicker.openPicker(config);
      }

      // Normalize single vs multiple response to array
      const resultsArray = Array.isArray(result) ? result : [result];

      // Map to clean selectedMedia objects
      const mappedMedia: SelectedMedia[] = resultsArray?.map(media => ({
        uri: media?.path,
        type: media?.mime,
        name: getFileNameFromPath(media?.path),
        size: media?.size,
        width: media?.width,
        height: media?.height,
        duration: media?.duration,
        isVideo: media?.mime.startsWith('video'),
      }));

      setSelectedMedia(mappedMedia);
      setLoading(false);
      return mappedMedia;
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Unknown error picking media');
      return [];
    }
  };

  // Utility to extract filename from path (can be just last segment)
  const getFileNameFromPath = (path: string) => {
    if (!path) return '';
    return path.split('/').pop() || '';
  };

  return { loading, selectedMedia, error, pickMedia };
}
