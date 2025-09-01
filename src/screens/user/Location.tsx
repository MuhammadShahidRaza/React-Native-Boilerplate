import { StyleSheet, View } from 'react-native';
import { Button, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, SETTINGS_TEXT } from 'constants/screens';
import { FontSize, FontWeight } from 'types/fontTypes';
import { getLocationPermission } from 'utils/location';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenHeight } from 'utils/helpers';
import { replace } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

export const Location = () => {
  return (
    <Wrapper>
      {/* <Map
        region={INITIAL_REGION}
        scrollEnabled={false}
        showCurrentLocationButton={false}
      /> */}
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Typography
            style={{
              textAlign: 'center',
              fontSize: FontSize.ExtraLarge,
              fontWeight: FontWeight.Bold,
            }}
          >
            {SETTINGS_TEXT.LOCATION_ACCESS}
          </Typography>
          <Typography
            style={{
              // fontSize: FontSize.MediumSmall,
              textAlign: 'center',
              fontWeight: FontWeight.Bold,
            }}
          >
            {SETTINGS_TEXT.ALLOW_LOCATION_DESCRIPTION}
          </Typography>
          <Button
            title={COMMON_TEXT.ALLOW_LOCATION}
            onPress={async () => {
              try {
                const hasPermission = await getLocationPermission();
                if (hasPermission) {
                  replace(SCREENS.BOTTOM_STACK);
                }
              } catch (error) {}
            }}
          />
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight(100),
    justifyContent: 'flex-end',
    backgroundColor: COLORS.WHITE_OPACITY,
  },
  subContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    height: screenHeight(28),
    borderRadius: 25,
    ...STYLES.GAP_15,
  },
});
