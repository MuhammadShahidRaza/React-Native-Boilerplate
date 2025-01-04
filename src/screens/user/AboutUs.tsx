import {StyleSheet, View} from 'react-native';
import {Button, Header, Photo, Typography, Wrapper} from 'components/common';
import {COMMON_TEXT, SETTINGS_TEXT} from 'constants/screens';
import {STYLES} from 'utils/commonStyles';
import {FontWeight} from 'types/fontTypes';
import {COLORS} from 'utils/colors';
import {IMAGES} from 'constants/assets';
import {screenHeight, screenWidth} from 'utils/helpers';

export const AboutUs = () => {
  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.ABOUT_US} />
      <View style={styles.container}>
        <Typography style={styles.headingQues}>
          {SETTINGS_TEXT.WHAT_IS_TRANSFORMATION_CUPPING}
        </Typography>
        <View>
          <Typography style={styles.description}>
            {SETTINGS_TEXT.ABOUT_TRANSFORMATION_CUPPING}
          </Typography>
          <Typography style={styles.description}>
            {SETTINGS_TEXT.ABOUT_2_TRANSFORMATION_CUPPING}
          </Typography>
        </View>
        <Typography style={styles.bottomHeading}>
          {SETTINGS_TEXT.ABOUT_3_TRANSFORMATION_CUPPING}
        </Typography>
        <Photo source={IMAGES.ABOUT_US} imageStyle={styles.aboutimage} />
        <Button title={SETTINGS_TEXT.FIND_THERAPIST} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {...STYLES.GAP_15, ...STYLES.CONTAINER, marginBottom: 20},
  description: {
    lineHeight: 22,
  },
  headingQues: {
    fontWeight: FontWeight.Bold,
    color: COLORS.MEDIUM_GREY,
  },
  bottomHeading: {
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    color: COLORS.MUD_TEXT,
  },
  aboutimage: {
    height: screenHeight(20),
    width: screenWidth(75),
    marginVertical: 10,
  },
});
