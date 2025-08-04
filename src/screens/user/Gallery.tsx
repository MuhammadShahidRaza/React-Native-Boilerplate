import { useEffect, useState } from 'react';
import { getRatinglist } from 'api/functions/app/home';
import { FlatListComponent, Photo } from 'components/common';
import { IMAGES } from 'constants/index';
import { StyleSheet, View } from 'react-native';
import { User, Vendor } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';
export interface GalleryItem {
  id: number;
  object_id: number;
  object_type: string;
  rating: number;
  review: string;
  created_at: string;
  user: User;
}

export const Gallery = ({ data }: { data: Vendor }) => {
  const [_, setGalleryListPage] = useState(1);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    if (!didLoad && data?.id) {
      fetchGallery(1);
      setGalleryListPage(1);
    }
  }, [data?.id]);

  const fetchGallery = async (page: number) => {
    if (isLoading || !data?.id || !hasMore) return;
    try {
      const response = await getRatinglist({ id: data.id, page });
      const newReviews = response?.gallery ?? [];
      const meta = response?.meta;

      setGalleryData(prev => [...prev, ...newReviews]);
      if (meta?.current_page >= meta?.last_page) {
        setHasMore(false);
      }
      if (page === 1) setDidLoad(true);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.tabContent}>
      <FlatListComponent
        data={galleryData}
        numColumns={2}
        scrollEnabled={true}
        renderItem={() => (
          <Photo
            source={IMAGES.HOTELS}
            imageStyle={styles.photoGrid}
            containerStyle={styles.photoContainer}
          />
        )}
        contentContainerStyle={styles.photosGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  photoContainer: {
    margin: 4,
    borderRadius: 8,
    ...STYLES.SHADOW,
  },
  photoGrid: {
    width: screenWidth(44),
    height: screenHeight(25),
    borderRadius: 8,
  },
  photosGrid: {
    paddingBottom: 40,
  },
});
