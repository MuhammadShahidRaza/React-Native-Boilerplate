import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const SendParcelFindingScreen = () => {
  useEffect(() => {
    const t = setTimeout(() => navigate(SCREENS.COURIER_MATCHED), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Wrapper
      headerTitle="Send Parcel"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
    >
      <View style={styles.center}>
        <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.circle}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName="bicycle"
            size={48}
            color={COLORS.WHITE}
          />
        </LinearGradient>
        <Typography style={styles.title}>Finding a Courier...</Typography>
        <Typography style={styles.sub}>Please wait while we match you</Typography>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  sub: {
    marginTop: 10,
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
    textAlign: 'center',
  },
});
