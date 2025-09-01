import { Button, Input, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, IMAGES, SCREENS, TEMPORARY_TEXT } from 'constants/index';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FontSize, FontWeight, useAppSelector } from 'types/index';
import {
  COLORS,
  FLEX_CENTER,
  STYLES,
  roundToNearestHalf,
  safeString,
  screenWidth,
} from 'utils/index';
import { AppScreenProps } from 'types/navigation';
import StarRating from 'react-native-star-rating-widget';

export const AddReview = ({ route }: AppScreenProps<typeof SCREENS.ADD_REVIEW>) => {
  const { userDetails } = useAppSelector(state => state?.user);
  const isNotEditable = route?.params?.isNotEditable;
  const [remarks, setRemarks] = useState<string>(isNotEditable ? safeString('') : '');
  const [rating, setRating] = useState(isNotEditable ? 0 : 0);

  return (
    <Wrapper useScrollView>
      <View style={styles.container}>
        <Photo
          source={isNotEditable ? IMAGES.USER : userDetails?.profile_image}
          resizeMode='contain'
          imageStyle={styles.userImage}
        />
        <Typography
          style={{
            fontSize: FontSize.Large,
            fontWeight: FontWeight.Bold,
          }}
        >
          {isNotEditable ? TEMPORARY_TEXT.JOHN_DOE : userDetails?.full_name}
        </Typography>

        {!isNotEditable && (
          <View style={{ ...STYLES.GAP_5 }}>
            <RowComponent style={{ justifyContent: 'center', ...STYLES.GAP_5 }}>
              <Typography style={{}}>{'How did you rate?'}</Typography>

              <Typography
                style={{
                  fontWeight: FontWeight.Bold,
                  width: screenWidth(50),
                }}
                numberOfLines={1}
              >
                {TEMPORARY_TEXT.JOHN_DOE}
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
          color={COLORS.SECONDARY}
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
        loading={true}
        disabled={isNotEditable || rating == 0 || remarks.length < 3}
        onPress={() => {
          const data = {
            object_id: 0,
            object_type: 'item',
            rating: rating,
            review: remarks,
          };
          console.log(data);
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
    borderRadius: 100,
  },
});
