import { Button, Input, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, IMAGES, SCREENS } from 'constants/index';
import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FontSize, FontWeight, useAppSelector } from 'types/index';
import { COLORS, FLEX_CENTER, STYLES, getDentorFromBooking, roundToNearestHalf } from 'utils/index';
import { AppScreenProps } from 'types/navigation';
import StarRating from 'react-native-star-rating-widget';
import { onBack } from 'navigation/index';
import { createReview } from 'api/functions/app/reviews';

export const AddReview = ({ route }: AppScreenProps<typeof SCREENS.ADD_REVIEW>) => {
  const isNotEditable = route?.params?.isNotEditable;
  const bookingId = route?.params?.bookingId;
  const userToReview = route?.params?.userToReview;
  const booking = route?.params?.booking;
  const reviewToView = route?.params?.review;
  const currentUser = useAppSelector(state => state?.user?.userDetails);
  const currentUserId = currentUser?.id;

  const displayUser = useMemo(
    () => getDentorFromBooking(booking ?? null, currentUserId) ?? userToReview,
    [userToReview, booking, currentUserId],
  );
  const displayName =
    displayUser?.full_name ??
    [displayUser?.first_name, displayUser?.last_name].filter(Boolean).join(' ') ??
    'Service Provider';
  const [remarks, setRemarks] = useState<string>(reviewToView?.comment ?? '');
  const [rating, setRating] = useState(reviewToView?.rating ?? 0);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Wrapper useScrollView headerTitle={isNotEditable ? 'View Review' : 'Add Review'}>
      <View style={styles.container}>
        <Photo
          source={displayUser?.profile_image ?? IMAGES.USER}
          resizeMode='contain'
          imageStyle={styles.userImage}
        />
        <Typography
          style={{
            fontSize: FontSize.Large,
            fontWeight: FontWeight.Bold,
          }}
        >
          {displayName}
        </Typography>

        {!isNotEditable && (
          <View style={{ ...STYLES.GAP_5, alignItems: 'center' }}>
            <RowComponent
              style={{ justifyContent: 'center', alignItems: 'center', ...STYLES.GAP_5 }}
            >
              <Typography style={{ textAlign: 'center' }}>{'How did you rate?'}</Typography>
              <Typography
                style={{
                  fontWeight: FontWeight.Bold,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {displayName}
              </Typography>
            </RowComponent>
            <Typography style={{ textAlign: 'center' }}>
              {'You can help others by sharing your experience'}
            </Typography>
          </View>
        )}

        <StarRating
          emptyColor={COLORS.BORDER}
          rating={isNotEditable ? roundToNearestHalf(rating) : rating}
          starSize={40}
          step='full'
          color={COLORS.PRIMARY}
          starStyle={{
            marginLeft: 20,
          }}
          onChange={isNotEditable ? () => {} : setRating}
        />
        <Input
          lineAfterIcon={false}
          value={remarks}
          editable={!isNotEditable}
          placeholder={'Write a review'}
          multiline={true}
          numberOfLines={4}
          inputContainerWithTitleStyle={{
            width: '100%',
          }}
          style={{
            height: 150,
            padding: 10,
            textAlignVertical: 'top',
          }}
          onChangeText={setRemarks}
          name={COMMON_TEXT.REMARKS}
        />
      </View>
      <Button
        title={COMMON_TEXT.SUBMIT}
        loading={submitting}
        disabled={isNotEditable || !bookingId || rating === 0}
        onPress={async () => {
          if (!bookingId) return;
          setSubmitting(true);
          try {
            const res = await createReview({
              booking_id: bookingId,
              rating,
              comment: remarks?.trim(),
            });
            if (res) onBack();
          } finally {
            setSubmitting(false);
          }
        }}
        style={{ marginVertical: 25, marginHorizontal: 20 }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.GAP_15,
    ...FLEX_CENTER,
    marginTop: 10,
    ...STYLES.CONTAINER,
  },
  userImage: {
    borderWidth: 0.5,
    borderColor: COLORS.LIGHT_GREY,
    width: 100,
    height: 100,
    backgroundColor: COLORS.WHITE,
    borderRadius: 100,
  },
});
