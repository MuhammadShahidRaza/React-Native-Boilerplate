import { ServiceCard } from 'components/appComponents';
import { FlatListComponent } from 'components/common';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';

export interface ServiceSpecifications {
  duration: string;
  includes: string[];
  therapist_gender: string;
}

export interface ServiceInquiryDetails {
  id: number;
  item_id: number;
  duration: number;
  gender_specific: string;
  about: string;
}

export interface ServiceItem {
  id: number;
  vendor_id: number;
  item_category_id: number | null;
  category_id: number;
  title: string;
  description: string;
  specifications: ServiceSpecifications;
  item_type: string;
  price: string;
  currency: string;
  stock_quantity: number | null;
  is_available: boolean;
  booking_required: boolean;
  call_only: boolean;
  featured: boolean;
  distance: number | null;
  rating_count: number;
  rating_avg: number | null;
  is_rated: boolean;
  is_liked: boolean;
  rating: any[];
  notification_count: number;
  createdAt: string;
  updatedAt: string;
  media: any[];
  serviceInquiryDetails: ServiceInquiryDetails;
}

export const Services = ({ data, itemData }: { data: any; itemData: any; heading: any }) => {
  const [_, setRoomListPage] = useState(1);
  const [serviceData, setServiceData] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    if (!didLoad && data?.id && !didLoad && itemData?.id) {
      fetchHotelRooms(1);
      setRoomListPage(1);
    }
  }, [data?.id, itemData?.id]);

  const fetchHotelRooms = async (page: number) => {
    if (isLoading || !data?.id || !hasMore) return;
    try {
      const response: any = null;
      const newItems = response?.result ?? [];

      const pagination = response?.pagination;
      setServiceData(prev => [...prev, ...newItems]);
      if (pagination?.current_page >= pagination?.last_page) {
        setHasMore(false);
      }
      if (page === 1) setDidLoad(true);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderServices = ({
    item,
    onPressItem,
  }: {
    item: ServiceItem;
    onPressItem?: (item: any) => void;
  }) => {
    return (
      <ServiceCard
        item={{
          name: item?.title,
          image: item?.media?.[0]?.media_url,
          price: item?.price,
        }}
        onPressItem={onPressItem}
        priceContainerStyle={{
          justifyContent: 'flex-start',
        }}
        priceTitle={'Price - '}
        priceStyle={{
          color: COLORS.SECONDARY,
        }}
      />
    );
  };

  return (
    <View style={styles.tabContent}>
      <FlatListComponent
        data={serviceData}
        numColumns={2}
        scrollEnabled={true}
        renderItem={renderServices}
        contentContainerStyle={styles.photosGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // reviewItem: {
  //   marginBottom: 10,
  //   paddingBottom: 15,
  //   borderBottomWidth: 1,
  //   borderColor: COLORS.BORDER,
  // },
  reviewItem: {
    paddingVertical: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },

  reviewDescription: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.PRIMARY,
    marginTop: 5,
  },
  tabBar: {
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    width: 'auto',
    ...STYLES.SHADOW,
  },
  tabBarContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 5,
  },
  tabButtonText: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    color: COLORS.DARK_GREY,
  },
  infoDescription: {
    color: COLORS.PRIMARY,
    flex: 1,
  },
  reviewHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  totalRatings: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.DARK_GREY,
  },
  reviewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
  },
  reviewsList: {
    paddingBottom: 100,
  },
  photosGrid: {
    paddingBottom: 40,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginTop: 20,
  },
  infoRow: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-start',
  },
  infoContainer: {
    gap: 15,
  },
  overallRatingContainer: { alignItems: 'center', gap: 8 },
  overallRating: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  ratingDistribution: {
    marginVertical: 10,
    gap: 8,
    width: screenWidth(55),
    paddingHorizontal: 5,
  },
  ratingRow: {
    gap: 8,
    alignItems: 'center',
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  writeReviewContainer: {
    marginTop: 20,
    gap: 15,
  },
  writeReviewTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  userReviewContainer: {
    gap: 15,
    alignItems: 'center',
  },
  reviewInput: {
    height: 100,
    width: '100%',
    padding: 10,
    textAlignVertical: 'top',
  },
  reviewsListContainer: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },

  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerAvatarContainer: {
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  reviewDate: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
  reviewText: {
    fontSize: FontSize.Medium,
    color: COLORS.DARK_GREY,
    lineHeight: 20,
  },
  addReview: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.SECONDARY,
  },
  serviceName: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.DARK_GREY,
  },
  servicePrice: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.DARK_GREY,
  },
  serviceContainer: {
    ...STYLES.SHADOW,
    padding: 10,
    gap: 5,
  },
});
