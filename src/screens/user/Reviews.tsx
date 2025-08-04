import { getRatinglist } from 'api/functions/app/home';
import { FlatListComponent, Icon, MessageBox, RowComponent, Typography } from 'components/common';
import { SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/Navigators';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { FontSize, FontWeight } from 'types/fontTypes';
import { User, Vendor } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { formatDate, roundToNearestHalf, screenHeight, screenWidth } from 'utils/helpers';
export interface ReviewItem {
  id: number;
  object_id: number;
  object_type: string;
  rating: number;
  review: string;
  created_at: string;
  user: User;
}

export const renderRatingBar = (percentage: number) => {
  return (
    <View style={styles.ratingBarContainer}>
      <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
    </View>
  );
};

export const Reviews = ({ data }: { data: Vendor }) => {
  const [_, setRatingListPage] = useState(1);
  const [ratingData, setRatingData] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    if (!didLoad && data?.id) {
      fetchReviews(1);
      setRatingListPage(1);
    }
  }, [data?.id]);

  const fetchReviews = async (page: number) => {
    if (isLoading || !data?.id || !hasMore) return;
    try {
      const response = await getRatinglist({ id: data.id, page });
      const newReviews = response?.reviews ?? [];
      const meta = response?.meta;
      const stats = response?.stats;

      setRatingData(prev => [...prev, ...newReviews]);
      setAverageRating(stats?.average_rating ?? 0);
      setTotalReviews(stats?.total_reviews ?? 0);
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

  const renderReviews = ({ item }: { item: ReviewItem }) => (
    <TouchableOpacity
      key={item?.id || item?.user?.full_name}
      onPress={() => {
        navigate(SCREENS.ADD_REVIEW, {
          isNotEditable: true,
          data: {
            vendor: data,
            item,
          },
        });
      }}
      style={styles.reviewItem}
    >
      <MessageBox
        containerStyle={{ marginHorizontal: 0 }}
        userImage={item?.user?.profile_image}
        hideBorder
        messageStyle={{ fontSize: FontSize.Small, color: COLORS.BORDER }}
        userName={item?.user?.full_name}
        message={formatDate(item?.created_at)}
      />
      <StarRating
        emptyColor={COLORS.BORDER}
        rating={roundToNearestHalf(item?.rating)}
        starSize={25}
        color={COLORS.SECONDARY}
        starStyle={{
          marginLeft: -2,
        }}
        onChange={() => {}}
      />
      <Typography style={styles.reviewDescription}>{item?.review}</Typography>
    </TouchableOpacity>
  );
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <RowComponent
          style={{
            justifyContent: 'flex-start',
            gap: 5,
          }}
        >
          <View style={styles.overallRatingContainer}>
            <Typography style={styles.overallRating}>{averageRating?.toString()}</Typography>
            <StarRating
              emptyColor={COLORS.BORDER}
              rating={roundToNearestHalf(averageRating)}
              starSize={22}
              color={COLORS.PRIMARY}
              starStyle={{ marginLeft: -5 }}
              onChange={() => {}}
            />
            <Typography style={styles.totalRatings}>{`(${totalReviews})`}</Typography>
          </View>
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map(stars => (
              <RowComponent key={stars} style={styles.ratingRow}>
                {renderRatingBar((100 / 5) * stars)}
              </RowComponent>
            ))}
          </View>
          <Icon iconName='info' componentName={VARIABLES.Feather} size={16} color={COLORS.BORDER} />
        </RowComponent>
        <RowComponent style={{ justifyContent: 'space-between', marginTop: 20 }}>
          <Typography style={styles.reviewsTitle}>Reviews</Typography>
          <RowComponent
            onPress={() => {
              navigate(SCREENS.ADD_REVIEW, {
                isNotEditable: false,
                data: {
                  vendor: data,
                },
              });
            }}
            style={{ gap: 5 }}
          >
            <Icon
              iconName='plus'
              componentName={VARIABLES.Feather}
              size={16}
              color={COLORS.SECONDARY}
            />
            <Typography style={styles.addReview}>Add Review</Typography>
          </RowComponent>
        </RowComponent>
        <FlatListComponent
          data={ratingData}
          renderItem={renderReviews}
          onRefresh={() => {
            setIsLoading(true);
            setRatingListPage(1);
            setRatingData([]);
            setHasMore(true);
            fetchReviews(1);
          }}
          refreshing={isLoading}
          // pagination={true}
          // onLoadMore={() => {
          //   if (!isLoading && hasMore) {
          //     const nextPage = ratingListPage + 1;
          //     setRatingListPage(nextPage);
          //     fetchReviews(nextPage);
          //   }
          // }}
          // isLoadingMore={isLoading && ratingListPage > 1}
        />
      </View>
    </ScrollView>
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
