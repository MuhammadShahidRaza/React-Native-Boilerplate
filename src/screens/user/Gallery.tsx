import { useEffect, useState } from 'react';
import { getGallerylist } from 'api/functions/app/home';
import { FlatListComponent, Photo } from 'components/common';
import { StyleSheet, View } from 'react-native';
import { CategoryItem, Vendor } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';

export interface GalleryItem {
  id: number;
  title: string;
  media_url: string;
  media_type: 'image';
  createdAt: string;
  updatedAt: string;
}

export const Gallery = ({ data, itemData }: { data: Vendor; itemData: CategoryItem }) => {
  const [_, setGalleryListPage] = useState(1);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    if ((!didLoad && data?.id) || (!didLoad && itemData?.id)) {
      fetchGallery(1);
      setGalleryListPage(1);
    }
  }, [data?.id, itemData?.id]);

  const fetchGallery = async (page: number) => {
    if (isLoading || !data?.id || !hasMore || !itemData?.id) return;
    try {
      const response = await getGallerylist({ id: itemData?.id ?? data?.id, page });
      const gallery = response?.galleries ?? [];
      const pagination = response?.pagination;

      setGalleryData(prev => [...prev, ...gallery]);
      if (pagination?.current_page >= pagination?.last_page) {
        setHasMore(false);
      }
      if (page === 1) setDidLoad(true);
    } catch (error) {
      console.error('Failed to load gallery:', error);
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
        renderItem={({ item }) => (
          <Photo
            key={item?.id}
            source={item?.media_url}
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
