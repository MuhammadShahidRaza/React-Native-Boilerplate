import { Button, Input, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, VARIABLES, IMAGES, TEMPORARY_TEXT, SCREENS } from 'constants/index';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS, FLEX_CENTER, STYLES, screenHeight, screenWidth } from 'utils/index';
import { onBack } from 'navigation/Navigators';
import { AppScreenProps } from 'types/navigation';
import StarRating from 'react-native-star-rating-widget';

export const AddReview = ({ route }: AppScreenProps<typeof SCREENS.ADD_REVIEW>) => {
  const isNotEditable = route?.params?.isNotEditable;
  const [remarks, setRemarks] = useState<string>(
    isNotEditable
      ? 'Great Experience At Friendly Staff, Skilled Service Providers, and a relaxing atmosphere. Highly Recommended.'
      : '',
  );
  const [rating, setRating] = useState(isNotEditable ? 5 : 0);

  return (
    <Wrapper useScrollView>
      <View style={styles.container}>
        <Photo source={IMAGES.USER} resizeMode='contain' imageStyle={styles.userImage} />
        <Typography
          style={{
            fontSize: FontSize.Large,
            fontWeight: FontWeight.Bold,
          }}
        >
          {TEMPORARY_TEXT.JOHN_DOE}
        </Typography>

        {!isNotEditable && (
          <View style={{ ...STYLES.GAP_5 }}>
            <RowComponent style={{ justifyContent: 'center', ...STYLES.GAP_5 }}>
              <Typography style={{}}>{'How did you rate?'}</Typography>

              <Typography
                style={{
                  fontWeight: FontWeight.Bold,
                }}
              >
                {'XYZ'}
              </Typography>
            </RowComponent>
            <Typography style={{ textAlign: 'center' }}>
              {'You can help others by sharing your experience'}
            </Typography>
          </View>
        )}

        <StarRating
          emptyColor={COLORS.BORDER}
          rating={rating}
          starSize={40}
          color={COLORS.SECONDARY}
          starStyle={{
            marginLeft: 20,
          }}
          onChange={isNotEditable ? () => {} : setRating}
        />
        <Input
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'star',
            size: 25,
          }}
          value={remarks}
          editable={!isNotEditable}
          placeholder={'Write a review'}
          multiline={true}
          numberOfLines={4}
          style={{
            height: 100,
            padding: 10,
            textAlignVertical: 'top',
          }}
          onChangeText={setRemarks}
          name={COMMON_TEXT.REMARKS}
        />
      </View>
      <Button
        title={COMMON_TEXT.SUBMIT}
        disabled={isNotEditable || rating == 0 || remarks.length < 3}
        onPress={() => {
          onBack();
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
    width: screenWidth(20),
    height: screenHeight(10),
    borderRadius: screenWidth(30),
  },
});
