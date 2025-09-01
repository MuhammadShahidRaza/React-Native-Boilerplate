import { useEffect, useRef, useState } from 'react';
import { FlatListComponent, Photo } from 'components/common';
import { StyleSheet, View } from 'react-native';
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

export const Gallery = ({ data, itemData }: { data: any; itemData: any }) => {
  const isLoadingRef = useRef(false);
  const [galleryListPage, setGalleryListPage] = useState(1);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = async () => {
    setHasMore(true);
    setIsRefreshing(true);
    setGalleryData([]);
    setGalleryListPage(1);
    await fetchGallery(1);
  };
  useEffect(() => {
    if ((!didLoad && data?.id) || (!didLoad && itemData?.id)) {
      fetchGallery(1);
      setGalleryListPage(1);
    }
  }, [data?.id, itemData?.id]);

  const fetchGallery = async (page: number) => {
    if (isLoadingRef.current || !data?.id || !hasMore || !itemData?.id) return;
    try {
      isLoadingRef.current = true;
      const response: any = null;
      const gallery = response?.result ?? [];
      const pagination = response?.pagination;
      setGalleryData(prev => [...prev, ...gallery]);
      if (pagination?.current_page >= pagination?.last_page) {
        setHasMore(false);
      }
      setGalleryListPage(page);
      if (page === 1) setDidLoad(true);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      isLoadingRef.current = false;
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.tabContent}>
      <FlatListComponent
        data={galleryData}
        numColumns={2}
        scrollEnabled={true}
        keyExtractor={item => item?.id?.toString()}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={() => {
          if (!isLoadingRef.current && hasMore) {
            fetchGallery(galleryListPage + 1);
          }
        }}
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
