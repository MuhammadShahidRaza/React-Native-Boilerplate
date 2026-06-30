import { StyleSheet, View } from 'react-native';
import { Button, Icon, RowComponent, Typography, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { resetSessionState } from 'store/resetSessionState';
import { clearSavedCredentials, clearUserStorageOnLogout } from 'utils/storage';
import CustomSwitch from 'components/common/SwitchButton';
import { useState } from 'react';
import { COMMON_TEXT } from 'constants/screens';
import { deleteAccount, logout } from 'api/functions/app/settings';
import { LogoutModal } from 'components/common/LogoutModal';
import store from 'store/store';
import { useTranslation } from 'hooks/index';
import { useAppSelector } from 'types/reduxTypes';
import { updateUserDetails } from 'api/functions/app/user';
import { deviceUdid } from 'utils/index';
import { APP_CONFIG } from 'config/app';

export const handleAccountLogout = async ({ isDelete }: { isDelete: boolean }) => {
  // 1. Call API first (needs token)
  if (isDelete) {
    await deleteAccount({});
    await clearSavedCredentials();
  } else {
    await logout({ udid: await deviceUdid() });
  }

  // 2. Clear all user-related storage (keychain + AsyncStorage)
  await clearUserStorageOnLogout();

  // 3. Reset all session Redux slices (user, worker online, cart, bookings, etc.)
  resetSessionState(store.dispatch);
};
export const Settings = () => {
  const { t } = useTranslation();
  const { userDetails, role } = useAppSelector(state => state?.user);

  const [isDeleteSelected, setIsDeleteSelected] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(userDetails?.is_notify == 1);

  const handleNotificationsEnabled = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    await updateUserDetails(
      {
        is_notify: value ? 1 : 0,
      },
      false,
    );
  };

  const tabs = [
    // {
    //   title: 'Change Theme',
    //   iconName: 'theme-light-dark',
    //   iconComponent: VARIABLES.MaterialCommunityIcons,
    //   onPress: () => navigate(SCREENS.THEME_SELECTOR),
    // },
    {
      title: 'Change Password',
      iconName: 'lock',
      iconComponent: VARIABLES.MaterialCommunityIcons,
      onPress: () => navigate(SCREENS.CHANGE_PASSWORD),
    },
    ...(role === APP_CONFIG.USER_ROLE
      ? [
          // {
          //   title: 'Favorites',
          //   iconName: 'heart',
          //   iconComponent: VARIABLES.Ionicons,
          //   onPress: () => navigate(SCREENS.FAVORITES),
          // },
          {
            title: 'Address',
            iconName: 'map-marker',
            iconComponent: VARIABLES.MaterialCommunityIcons,
            onPress: () => navigate(SCREENS.LOCATION),
          },
        ]
      : []),
    // {
    //   title: COMMON_TEXT.LANGUAGE,
    //   onPress: () => navigate(SCREENS.LANGUAGE),
    // },
    {
      title: COMMON_TEXT.PRIVACY_POLICY,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.PRIVACY_POLICY,
        }),
      iconName: 'privacy-tip',
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: COMMON_TEXT.TERMS_AND_CONDITIONS,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.TERMS_AND_CONDITIONS,
        }),
      iconName: 'privacy-tip',
      iconComponent: VARIABLES.MaterialIcons,
    },
    {
      title: COMMON_TEXT.ABOUT_US,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.ABOUT_US,
        }),
      iconName: 'privacy-tip',
      iconComponent: VARIABLES.MaterialIcons,
    },
    // {
    //   title: 'Cancellation Policy',
    //   onPress: () =>
    //     navigate(SCREENS.PRIVACY_POLICY, {
    //       title: 'Cancellation Policy',
    //     }),
    //   iconName: 'cancel',
    //   iconComponent: VARIABLES.MaterialCommunityIcons,
    // },
    // {
    //   title: 'Icon Selector',
    //   iconName: 'credit-card',
    //   iconComponent: VARIABLES.Entypo,
    //   onPress: () => navigate(SCREENS.ICON_SELECTOR),
    // },
    // {
    //   title: COMMON_TEXT.CONTACT_US,

    //   onPress: () => navigate(SCREENS.CONTACT_US),
    // },
    {
      title: 'Delete Account',
      onPress: () => {
        setIsDeleteSelected(true);
        setIsModalVisible(true);
      },
      iconName: 'delete-forever',
      iconComponent: VARIABLES.MaterialCommunityIcons,
      color: COLORS.RED,
    },
  ];

  return (
    <Wrapper useScrollView headerTitle={t(COMMON_TEXT.SETTINGS)} showBackButton={true}>
      <View style={styles.tabsContainer}>
        <Typography style={styles.titleText}>{'Account Settings'}</Typography>
        <RowComponent
          style={[
            styles.rowContainer,
            {
              ...STYLES.SHADOW,
              backgroundColor: COLORS.SURFACE,
              paddingVertical: 10,
              borderRadius: 20,
              borderBottomWidth: 0,
            },
          ]}
        >
          <Button
            containerStyle={styles.buttonContainer}
            title={'Notifications'}
            textStyle={{ ...styles.buttonText }}
            style={styles.button}
          />
          <CustomSwitch
            style={{ marginRight: 10 }}
            value={isNotificationsEnabled}
            onValueChange={handleNotificationsEnabled}
          />
        </RowComponent>
      </View>

      <View style={styles.tabsContainer}>
        <Typography style={styles.titleText}>{'Basic Settings'}</Typography>
        {tabs.map(({ title, iconName, iconComponent, onPress, color }) => (
          <RowComponent style={[styles.rowContainer]} onPress={onPress} key={title}>
            <Button
              key={title}
              onPress={onPress}
              containerStyle={styles.buttonContainer}
              title={title}
              textStyle={{ ...styles.buttonText, color }}
              style={styles.button}
              startIcon={{
                componentName: iconComponent,
                iconName,
                color: COLORS.WHITE,
                iconStyle: {
                  backgroundColor: COLORS.PRIMARY,
                  padding: 5,
                  borderRadius: 4,
                },
                size: FontSize.Large,
              }}
            />
            <Icon
              componentName={VARIABLES.Entypo}
              iconName={'chevron-small-right'}
              color={color ?? COLORS.BORDER}
              iconStyle={{ marginRight: 10 }}
              size={FontSize.Large}
            />
          </RowComponent>
        ))}
      </View>
      <LogoutModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        isDelete={isDeleteSelected}
        onConfirm={() => handleAccountLogout({ isDelete: isDeleteSelected })}
      />
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
    color: COLORS.TEXT,
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
    marginVertical: 20,
  },
  userNameStyle: {
    color: COLORS.WHITE,
    textTransform: 'capitalize',
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumLarge,
  },
  messageStyle: {
    color: COLORS.WHITE,
    textTransform: 'capitalize',
  },
  userImageStyle: {
    borderRadius: 80,
    height: 80,
    width: 80,
  },
  messageContainer: {
    marginBottom: 15,
  },
  titleText: {
    color: COLORS.TEXT,
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    marginBottom: 10,
  },
});
