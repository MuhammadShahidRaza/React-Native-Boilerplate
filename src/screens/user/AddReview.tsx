import {
  Button,
  Header,
  Input,
  Photo,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/common';
import {
  COMMON_TEXT,
  VARIABLES,
  IMAGES,
  PRACTITIONER_TEXT,
  TEMPORARY_TEXT,
} from 'constants/index';
import {useState} from 'react';
import {View} from 'react-native';
import {FontSize, FontWeight, StackParamList} from 'types/index';
import {
  COLORS,
  FLEX_CENTER,
  STYLES,
  screenHeight,
  screenWidth,
} from 'utils/index';
// import StarRating from 'react-native-star-rating-widget';
import i18n from 'i18n/index';
import {RouteProp} from '@react-navigation/native';
import {onBack} from 'navigation/Navigators';

type AddReviewScreenRouteProp = RouteProp<StackParamList, 'AddReview'>;

interface Props {
  route: AddReviewScreenRouteProp;
}

export const AddReview = ({route}: Props) => {
  const isNotEditable = route?.params?.isNotEditable;
  const [remarks, setRemarks] = useState<string>(
    isNotEditable ? i18n.t(TEMPORARY_TEXT.REMARKS) : '',
  );
  const [rating, setRating] = useState(isNotEditable ? 5 : 0);

  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.REVIEW} />
      <View style={STYLES.CONTAINER}>
        <View style={{marginVertical: 20, ...STYLES.GAP_15, ...FLEX_CENTER}}>
          <Photo
            source={IMAGES.USER}
            resizeMode="contain"
            imageStyle={{
              width: screenWidth(30),
              height: screenHeight(15),
              borderWidth: 3,
              borderColor: COLORS.MUD_TEXT,
              borderRadius: screenWidth(30),
            }}
          />
          <Typography
            style={{
              fontSize: FontSize.ExtraLarge,
              fontWeight: FontWeight.Bold,
            }}>
            {TEMPORARY_TEXT.DR_KIM}
          </Typography>

          {!isNotEditable && (
            <View>
              <RowComponent style={{justifyContent: 'center', ...STYLES.GAP_5}}>
                <Typography style={{}}>
                  {PRACTITIONER_TEXT.HOW_DID_YOU_RATE}
                </Typography>

                <RowComponent>
                  <Typography
                    style={{
                      // fontSize: FontSize.ExtraLarge,
                      fontWeight: FontWeight.Bold,
                    }}>
                    {TEMPORARY_TEXT.DR_KIM}
                  </Typography>
                  <Typography
                    style={{
                      // fontSize: FontSize.ExtraLarge,
                      fontWeight: FontWeight.Bold,
                    }}>
                    {VARIABLES.QUESTION_MARK}
                  </Typography>
                </RowComponent>
              </RowComponent>
              <Typography style={{}}>
                {PRACTITIONER_TEXT.YOUR_REVIEW_CAN_HELP}
              </Typography>
            </View>
          )}

          {/* <StarRating
            emptyColor={COLORS.BORDER}
            rating={rating}
            starSize={50}
            color={COLORS.MUD_TEXT}
            starStyle={{
              marginLeft: 20,
            }}
            onChange={isNotEditable ? () => {} : setRating}
          /> */}

          <RowComponent style={{marginBottom: 20, gap: 15}}>
            {[
              COMMON_TEXT.VERY_BAD,
              COMMON_TEXT.BAD,
              COMMON_TEXT.AVERAGE,
              COMMON_TEXT.GOOD,
              COMMON_TEXT.VERY_GOOD,
            ].map(item => (
              <Typography
                key={item}
                style={{
                  width: 60,
                  textAlign: 'center',
                  color: COLORS.BORDER,
                  fontSize: FontSize.Small,
                }}>
                {item}
              </Typography>
            ))}
          </RowComponent>
        </View>
        <Input
          value={remarks}
          editable={!isNotEditable}
          placeholder={COMMON_TEXT.REMARKS}
          secondContainerStyle={{
            borderWidth: 0,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.BORDER,
          }}
          onChangeText={setRemarks}
          name={COMMON_TEXT.REMARKS}
        />

        <Button
          title={COMMON_TEXT.SUBMIT}
          disabled={isNotEditable || rating == 0}
          onPress={() => {
            onBack();
          }}
          style={{marginVertical: 50}}
        />
      </View>
    </Wrapper>
  );
};
