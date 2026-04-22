import { View, StyleSheet } from 'react-native';
import { ModalComponent } from '../common/Modal';
import { Typography } from '../common/Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { RowComponent } from '../common/Row';
import { Booking } from 'types/responseTypes';
import { formatDateMonthDayYear } from 'utils/helpers/functions';
import { FlatListComponent } from 'components/common';

interface ReviewDisplay {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsModalProps {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  item: Booking;
  reviews?: ReviewDisplay[];
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isVisible,
  setIsVisible,
  item,
  reviews = [],
}) => {
  const reviewerName =
    item?.user?.full_name ??
    [item?.user?.first_name, item?.user?.last_name].filter(Boolean).join(' ') ??
    'Customer';
  const fromBooking = item?.review
    ? [
        {
          id: item?.review.id,
          customer_name: reviewerName,
          rating: item?.review.rating,
          comment: item?.review.comment,
          date: item?.review.created_at ?? '',
        },
      ]
    : [];
  const displayReviews = fromBooking?.length > 0 ? fromBooking : reviews.length > 0 ? reviews : [];

  return (
    <ModalComponent
      modalVisible={isVisible}
      setModalVisible={setIsVisible}
      position='center'
      wantToCloseOnTop={true}
      wantToCloseOnBack={true}
      closeIcon={true}
      scroll={true}
      modalSecondaryContainerStyle={styles.modalContent}
    >
      <View style={styles.container}>
        <Typography style={styles.titleText}>Rating & Reviews</Typography>
        <Typography style={styles.subtitleText}>
          {`${[item?.vehicle_make, item?.vehicle_year].filter(Boolean).join(' ') || item?.service?.name || ''} - ${item?.service_type?.name || ''}`}
        </Typography>

        {displayReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography style={styles.emptyText}>No reviews yet</Typography>
          </View>
        ) : (
          <FlatListComponent
            data={displayReviews}
            renderItem={({ item: review }) => (
              <View style={styles.reviewCard}>
                <RowComponent style={styles.reviewHeader}>
                  <Typography style={styles.reviewerName}>{review.customer_name}</Typography>
                  <Typography style={styles.reviewDate}>
                    {formatDateMonthDayYear(review.date)}
                  </Typography>
                </RowComponent>
                <RowComponent style={styles.ratingContainer}>
                  <Typography style={styles.ratingText}>
                    {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                  </Typography>
                </RowComponent>
                <Typography style={styles.reviewComment}>{review.comment}</Typography>
              </View>
            )}
            keyExtractor={item => `review-${item.id}`}
            contentContainerStyle={styles.reviewsList}
            scrollEnabled={true}
          />
        )}

        {/* <Button
                    style={styles.closeButton}
                    textStyle={styles.closeButtonText}
                    title='Close'
                    onPress={() => setIsVisible(false)}
                /> */}
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  modalContent: {
    maxHeight: '80%',
  },
  titleText: {
    fontSize: FontSize.XL,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
  },
  reviewsList: {},
  reviewCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.BORDER,
  },
  reviewHeader: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.TEXT,
  },
  reviewDate: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingText: {
    fontSize: FontSize.Medium,
    color: COLORS.PRIMARY,
  },
  reviewComment: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT,
    lineHeight: 20,
  },
  closeButton: {
    padding: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
  },
});
