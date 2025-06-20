import {
  FlatListComponent,
  Header,
  MessageBox,
  Photo,
  Typography,
  Wrapper,
} from 'components/common';
import { IMAGES } from 'constants/assets';
import { COMMON_TEXT, SCREENS, TEMPORARY_TEXT } from 'constants/index';
import { navigate } from 'navigation/Navigators';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  created_at: string;
  description: string;
};

export const reviewsList = [
  {
    id: '1',
    name: TEMPORARY_TEXT.JOHN_DOE,
    rating: 5.0,
    created_at: 'Monday, July 29, 2025 At 9:49 AM',
    description:
      'Great Experience At Friendly Staff, Skilled Service Providers, and a relaxing atmosphere. Highly Recommended.',
  },
  {
    id: '2',
    name: TEMPORARY_TEXT.JOHN_DOE,
    rating: 4.0,
    created_at: 'Monday, July 29, 2025 At 9:49 AM',
    description:
      'Great Experience At Friendly Staff, Skilled Service Providers, and a relaxing atmosphere. Highly Recommended.',
  },
  {
    id: '3',
    name: TEMPORARY_TEXT.JOHN_DOE,
    rating: 3.5,
    created_at: 'Monday, July 29, 2025 At 9:49 AM',
    description:
      'Great Experience At Friendly Staff, Skilled Service Providers, and a relaxing atmosphere. Highly Recommended.',
  },
];

export const renderReviews = ({ item }: { item: ReviewItem }) => (
  <TouchableOpacity
    onPress={() => {
      navigate(SCREENS.ADD_REVIEW, {
        isNotEditable: true,
      });
    }}
    style={styles.reviewItem}
  >
    <MessageBox
      key={item?.id || item?.name}
      containerStyle={{ marginHorizontal: 0 }}
      userImage={IMAGES.USER}
      hideBorder
      messageStyle={{ fontSize: FontSize.Small, color: COLORS.BORDER }}
      userName={item?.name}
      message={item?.created_at}
    />
    <StarRating
      emptyColor={COLORS.BORDER}
      rating={item?.rating}
      starSize={25}
      color={COLORS.SECONDARY}
      starStyle={{
        marginLeft: -2,
      }}
      onChange={() => {}}
    />
    <Typography style={styles.reviewDescription}>{item?.description}</Typography>
  </TouchableOpacity>
);

export const Reviews = () => {
  return (
    <Wrapper>
      <Header title={COMMON_TEXT.REVIEWS} />
      <View style={STYLES.CONTAINER}>
        <View style={{ marginVertical: 20, ...STYLES.GAP_15, ...FLEX_CENTER }}>
          <Photo
            source={IMAGES.USER}
            resizeMode='contain'
            imageStyle={{
              width: screenWidth(30),
              height: screenHeight(15),
              borderWidth: 3,
              borderColor: COLORS.SECONDARY,
              borderRadius: screenWidth(30),
            }}
          />
          <Typography
            style={{
              fontSize: FontSize.ExtraLarge,
              fontWeight: FontWeight.Bold,
            }}
          >
            {TEMPORARY_TEXT.JOHN_DOE}
          </Typography>
        </View>
        <FlatListComponent data={reviewsList} renderItem={renderReviews} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  reviewItem: {
    marginBottom: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER,
  },
  reviewDescription: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.PRIMARY,
    marginTop: 5,
  },
});
