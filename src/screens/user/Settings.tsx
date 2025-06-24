import { StyleSheet, View } from 'react-native';
import { Button, Icon, RowComponent, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { removeMultipleItem } from 'utils/storage';
import { useAppDispatch } from 'types/reduxTypes';
import CustomSwitch from 'components/common/SwitchButton';
import { useState } from 'react';

export const Settings = () => {
  const dispatch = useAppDispatch();
  const handleDeactivateAccount = async () => {
    dispatch(setIsUserLoggedIn(false));
    await removeMultipleItem([VARIABLES.USER_TOKEN, VARIABLES.IS_USER_LOGGED_IN]);
  };
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const tabs = [
    {
      title: 'Select Region',
      onPress: () => navigate(SCREENS.SELECT_REGION),
    },
    {
      title: 'Language',
      onPress: () => navigate(SCREENS.LANGUAGE),
    },
    {
      title: 'Notifications',
      onPress: () => {},
      endIcon: (
        <CustomSwitch
          style={styles.switch}
          value={isNotificationsEnabled}
          onValueChange={setIsNotificationsEnabled}
        />
      ),
    },
    {
      title: 'Privacy Policy',
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: 'Privacy Policy',
        }),
    },
    {
      title: 'Terms & Conditions',
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: 'Terms & Conditions',
        }),
    },
    {
      title: 'About Us',
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: 'About Us',
        }),
    },
    {
      title: 'Contact Us',
      onPress: () => navigate(SCREENS.CONTACT_US),
    },
    {
      title: 'Logout',
      onPress: handleDeactivateAccount,
      color: COLORS.RED,
    },
    {
      title: 'Delete Account',
      onPress: handleDeactivateAccount,
      color: COLORS.RED,
    },
  ];

  return (
    <Wrapper useScrollView useSafeArea={false}>
      <View style={styles.tabsContainer}>
        {tabs.map(({ title, onPress, endIcon, color = COLORS.PRIMARY }) => (
          <RowComponent style={styles.rowContainer} onPress={onPress} key={title}>
            <Button
              key={title}
              onPress={onPress}
              containerStyle={styles.buttonContainer}
              title={title}
              textStyle={{ ...styles.buttonText, color }}
              style={styles.button}
            />
            {endIcon ? (
              endIcon
            ) : (
              <Icon
                componentName={VARIABLES.Entypo}
                iconName={'chevron-small-right'}
                color={color ? color : COLORS.BORDER}
                iconStyle={{ marginRight: 10 }}
                size={FontSize.Large}
              />
            )}
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

    padding: 17,
    borderRadius: 15,
  },
  button: {
    padding: 0,
    backgroundColor: COLORS.TRANSPARENT,
  },
  buttonText: {
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
  switch: {
    marginRight: 10,
  },
});
