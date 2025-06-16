import { Button, Header, Input, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, VARIABLES, IMAGES, TEMPORARY_TEXT, SCREENS } from 'constants/index';
import { useState } from 'react';
import { View } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS, FLEX_CENTER, STYLES, screenHeight, screenWidth } from 'utils/index';
// import StarRating from 'react-native-star-rating-widget';
import i18n from 'i18n/index';
import { onBack } from 'navigation/Navigators';
import { AppScreenProps } from 'types/navigation';

export const AddReview = ({ route }: AppScreenProps<typeof SCREENS.ADD_REVIEW>) => {
  const isNotEditable = route?.params?.isNotEditable;
  const [remarks, setRemarks] = useState<string>(isNotEditable ? i18n.t(COMMON_TEXT.REMARKS) : '');
  const [rating, setRating] = useState(isNotEditable ? 5 : 0);

  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.REVIEW} />
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

          {!isNotEditable && (
            <View>
              <RowComponent style={{ justifyContent: 'center', ...STYLES.GAP_5 }}>
                <Typography style={{}}>{COMMON_TEXT.NEED_A_HELP}</Typography>

                <RowComponent>
                  <Typography
                    style={{
                      // fontSize: FontSize.ExtraLarge,
                      fontWeight: FontWeight.Bold,
                    }}
                  >
                    {TEMPORARY_TEXT.JOHN_DOE}
                  </Typography>
                  <Typography
                    style={{
                      // fontSize: FontSize.ExtraLarge,
                      fontWeight: FontWeight.Bold,
                    }}
                  >
                    {VARIABLES.QUESTION_MARK}
                  </Typography>
                </RowComponent>
              </RowComponent>
              <Typography style={{}}>{COMMON_TEXT.NEED_A_HELP}</Typography>
            </View>
          )}

          {/* <StarRating
            emptyColor={COLORS.BORDER}
            rating={rating}
            starSize={50}
            color={COLORS.SECONDARY}
            starStyle={{
              marginLeft: 20,
            }}
            onChange={isNotEditable ? () => {} : setRating}
          /> */}

          <RowComponent style={{ marginBottom: 20, gap: 15 }}>
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
                }}
              >
                {item}
              </Typography>
            ))}
          </RowComponent>
        </View>
        <Input
          startIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'apple1',
            size: 25,
          }}
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
          style={{ marginVertical: 50 }}
        />
      </View>
    </Wrapper>
  );
};
