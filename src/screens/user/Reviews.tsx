import {
  FlatListComponent,
  Header,
  MessageBox,
  Photo,
  Typography,
  Wrapper,
} from 'components/common';
import { IMAGES } from 'constants/assets';
import { VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { navigate } from 'navigation/Navigators';
import { View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { isIOS, screenHeight, screenWidth } from 'utils/helpers';

type ReviewItem = {
  id: string;
  name: string;
  remarks: string;
  ratings: string;
};

export const reviewsList = [
  {
    id: '1',
    name: TEMPORARY_TEXT.JOHN_DOE,
    remarks: COMMON_TEXT.REMARKS,
    ratings: TEMPORARY_TEXT.RATING,
  },
  {
    id: '2',
    name: TEMPORARY_TEXT.JOHN_DOE,
    remarks: COMMON_TEXT.REMARKS,
    ratings: TEMPORARY_TEXT.RATING,
  },
  {
    id: '3',
    name: TEMPORARY_TEXT.JOHN_DOE,
    remarks: COMMON_TEXT.REMARKS,
    ratings: TEMPORARY_TEXT.RATING,
  },
];

export const renderReviews = ({ item }: { item: ReviewItem }) => (
  <MessageBox
    key={item?.id || item?.name}
    onPress={() => {
      navigate(SCREENS.ADD_REVIEW, {
        isNotEditable: true,
      });
    }}
    containerStyle={{ marginHorizontal: 0 }}
    userImage={IMAGES.USER}
    messageStyle={{ fontSize: FontSize.MediumSmall }}
    userName={item?.name}
    hideBorder
    endIcon={{
      componentName: VARIABLES.Ionicons,
      iconName: 'star',
      iconStyle: { marginBottom: isIOS() ? 3 : 0 },
      size: FontSize.Small,
      color: COLORS.SECONDARY,
    }}
    time={item?.ratings}
    message={item?.remarks}
  />
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
