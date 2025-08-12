import { View, StyleSheet, Share } from 'react-native';
import { Button, Header, Icon, RowComponent, Wrapper } from 'components/common';
import { COMMON_TEXT, VARIABLES, SCREENS } from 'constants/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { STYLES, COLORS, safeNumber } from 'utils/index';
import { navigate } from 'navigation/Navigators';
import { useAppSelector } from 'types/reduxTypes';

export const MyAccount = () => {
  const { userDetails } = useAppSelector(state => state?.user);

  const tabs = [
    {
      title: 'My Profile',
      iconName: 'user',
      onPress: () => navigate(SCREENS.PROFILE),
      iconComponent: VARIABLES.Feather,
    },
    {
      title: 'Payment Details',
      iconName: 'credit-card',
      iconComponent: VARIABLES.Entypo,
      onPress: () => navigate(SCREENS.ADD_CARD),
    },
    {
      title: 'Invite a friend',
      iconName: 'person-add-alt',
      onPress: () => {
        Share.share({
          message: 'Share the app with your friends',
        });
      },
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: 'Wallet',
      iconName: 'wallet-outline',
      onPress: () => navigate(SCREENS.WALLET),
      iconComponent: VARIABLES.Ionicons,
    },
    {
      title: COMMON_TEXT.SETTINGS,
      iconName: 'settings',
      onPress: () => navigate(SCREENS.SETTINGS),
      iconComponent: VARIABLES.Feather,
    },
  ];

  return (
    <Wrapper useScrollView>
      <Header
        title={'My Account'}
        endIcon={
          <View>
            <Icon
              onPress={() => {
                navigate(SCREENS.NOTIFICATIONS);
              }}
              iconName={'bell-outline'}
              componentName={VARIABLES.MaterialCommunityIcons}
              size={FontSize.ExtraLarge}
              iconStyle={styles.iconStyle}
              color={COLORS.PRIMARY}
            />
            {safeNumber(userDetails?.notification_count) > 0 && (
              <View style={styles.notificationDot} />
            )}
          </View>
        }
      />

      <View style={styles.tabsContainer}>
        {tabs.map(({ title, iconName, iconComponent, onPress }) => (
          <RowComponent style={styles.rowContainer} onPress={onPress} key={title}>
            <Button
              key={title}
              onPress={onPress}
              containerStyle={styles.buttonContainer}
              title={title}
              textStyle={styles.buttonText}
              style={styles.button}
              startIcon={{
                componentName: iconComponent,
                iconName,
                color: COLORS.PRIMARY,
                size: FontSize.Large,
              }}
            />
            <Icon
              componentName={VARIABLES.Entypo}
              iconName={'chevron-small-right'}
              color={COLORS.BORDER}
              iconStyle={{ marginRight: 10 }}
              size={FontSize.Large}
            />
          </RowComponent>
        ))}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    borderBottomColor: COLORS.LIGHT_GREY,
    borderBottomWidth: 0.5,
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    gap: 20,

    padding: 15,
    borderRadius: 15,
  },
  button: {
    padding: 0,
    backgroundColor: COLORS.TRANSPARENT,
  },
  buttonText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Medium,
  },
  notificationDot: {
    backgroundColor: COLORS.RED,
    height: 8,
    width: 8,
    borderRadius: 8,
    borderColor: COLORS.PRIMARY,
    position: 'absolute',
    right: 8,
    top: 9,
    borderWidth: 1,
  },
  iconStyle: {
    padding: 6,
    borderRadius: 6,
    ...STYLES.SHADOW,
  },
  tabsContainer: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    ...STYLES.SHADOW,
  },
});
