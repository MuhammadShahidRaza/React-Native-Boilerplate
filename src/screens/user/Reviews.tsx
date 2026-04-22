import { FlatListComponent, Icon, RowComponent, Typography, Wrapper } from 'components/common';
import { SCREENS, VARIABLES } from 'constants/index';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { FontSize, FontWeight } from 'types/fontTypes';
import { User } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import {
  formatDate,
  roundToNearestHalf,
  safeNumber,
  screenHeight,
  screenWidth,
} from 'utils/helpers';
import { getReviewsByUserId } from 'api/functions/app/reviews';
import { logger } from 'utils/logger';
import type { Review } from 'types/responseTypes';
import { AppScreenProps } from 'types/navigation';

export interface ReviewItem {
  id: number;
  object_id: number;
  object_type: string;
  rating: number;
  review: string;
  created_at: string;
  user: User;
}
export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
}
export const renderRatingBar = (percentage: number) => {
  return (
    <View style={styles.ratingBarContainer}>
      <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
    </View>
  );
};

export const Reviews = ({ route }: AppScreenProps<typeof SCREENS.REVIEWS>) => {
  const userId = route?.params?.userId;
  const [ratingListPage, setRatingListPage] = useState(1);
  const [ratingData, setRatingData] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReviews = useCallback(
    async (page: number) => {
      if (isLoading || !userId || !hasMore) return;
      try {
        setIsLoading(true);
        const response = await getReviewsByUserId(userId, page);
        const newReviews = response?.Reviews ?? [];
        setRatingData(prev => {
          const allReviews = page === 1 ? newReviews : [...prev, ...newReviews];
          const total = response?.total ?? allReviews.length;
          const avg =
            allReviews.length > 0
              ? allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length
              : 0;
          setRatingStats({
            total_reviews: total,
            average_rating: avg,
            rating_breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          });
          return allReviews;
        });
        if ((response?.last_page ?? 1) <= page) setHasMore(false);
        setRatingListPage(page);
        if (page === 1) setDidLoad(true);
      } catch (error) {
        logger.error('Failed to load reviews:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId, isLoading, hasMore],
  );

  const onRefresh = useCallback(async () => {
    setHasMore(true);
    setIsRefreshing(true);
    setRatingData([]);
    await fetchReviews(1);
  }, [fetchReviews]);

  useEffect(() => {
    if (userId && !didLoad) {
      fetchReviews(1);
    } else if (!userId) {
      setIsLoading(false);
    }
  }, [userId, didLoad, fetchReviews]);

  const renderReviews = ({ item }: { item: Review }) => (
    <View key={item?.id} style={styles.reviewItem}>
      <Typography style={styles.reviewDate}>{formatDate(item?.created_at)}</Typography>
      <StarRating
        step='full'
        emptyColor={COLORS.BORDER}
        rating={roundToNearestHalf(item?.rating)}
        starSize={25}
        color={COLORS.PRIMARY}
        starStyle={{ marginLeft: -2 }}
        onChange={() => {}}
      />
      <Typography style={styles.reviewDescription}>{item?.comment}</Typography>
    </View>
  );
  // if (!userId) {
  //   return (
  //     <Wrapper headerTitle="Reviews">
  //       <View style={[styles.tabContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
  //         <Typography style={styles.reviewDescription}>No user selected. Open reviews from a bid card.</Typography>
  //       </View>
  //     </Wrapper>
  //   );
  // }

  return (
    <Wrapper headerTitle='Reviews'>
      <View style={styles.tabContent}>
        <RowComponent
          style={{
            justifyContent: 'flex-start',
            gap: 5,
          }}
        >
          <View style={styles.overallRatingContainer}>
            <Typography style={styles.overallRating}>
              {safeNumber(ratingStats?.average_rating)?.toString()}
            </Typography>
            <StarRating
              step='full'
              emptyColor={COLORS.BORDER}
              rating={roundToNearestHalf(safeNumber(ratingStats?.average_rating))}
              starSize={22}
              color={COLORS.PRIMARY}
              starStyle={{ marginLeft: -5 }}
              onChange={() => {}}
            />
            <Typography style={styles.totalRatings}>{`( ${safeNumber(
              ratingStats?.total_reviews,
            )}) `}</Typography>
          </View>
          <View style={styles.ratingDistribution}>
            {/* {[5, 4, 3, 2, 1].map(stars => {
              let count = ratingStats?.rating_breakdown?.[stars] ?? 0;
              if (stars === 3) {
                count += ratingStats?.rating_breakdown?.[2] ?? 0; // move 2.5 into 3
              }
              const total = ratingStats?.total_reviews ?? 0;

              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <RowComponent key={stars} style={styles.ratingRow}>
                  {renderRatingBar(percentage)}
                </RowComponent>
              );
            })} */}
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
          {/* <RowComponent
            onPress={() => {
              navigate(SCREENS.ADD_REVIEW, {
                isNotEditable: false,
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
          </RowComponent> */}
        </RowComponent>
        <FlatListComponent
          data={ratingData}
          renderItem={renderReviews}
          refreshing={isRefreshing}
          keyExtractor={item => item?.id?.toString()}
          onRefresh={onRefresh}
          onEndReached={() => {
            if (!isLoading && hasMore) {
              fetchReviews(ratingListPage + 1);
            }
          }}
        />
      </View>
    </Wrapper>
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
  reviewDate: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
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
    backgroundColor: COLORS.BACKGROUND,
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
  reviewerDate: {
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
