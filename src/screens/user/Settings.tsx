import { StyleSheet, View } from 'react-native';
import { Button, Icon, RowComponent, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { clearAllStorageItems } from 'utils/storage';
import { useAppDispatch } from 'types/reduxTypes';
import CustomSwitch from 'components/common/SwitchButton';
import { useState } from 'react';
import { COMMON_TEXT } from 'constants/screens';
import { deleteAccount, logout } from 'api/functions/app/settings';
import { LogoutModal } from 'components/common/LogoutModal';
import { setUserDetails } from 'store/slices/user';

export const Settings = () => {
  const dispatch = useAppDispatch();
  const [isDeleteSelected, setIsDeleteSelected] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleAccount = async ({ isDelete }: { isDelete: boolean }) => {
    dispatch(setIsUserLoggedIn(false));
    dispatch(setUserDetails(null));
    if (isDelete) {
      deleteAccount({});
    } else {
      logout({ device_udid: 'ewe' });
    }
    clearAllStorageItems();
  };

  const tabs = [
    {
      title: COMMON_TEXT.LANGUAGE,
      onPress: () => navigate(SCREENS.LANGUAGE),
    },
    {
      title: COMMON_TEXT.NOTIFICATIONS,
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
      title: COMMON_TEXT.PRIVACY_POLICY,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.PRIVACY_POLICY,
        }),
    },
    {
      title: COMMON_TEXT.TERMS_AND_CONDITIONS,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.TERMS_AND_CONDITIONS,
        }),
    },
    {
      title: COMMON_TEXT.ABOUT_US,
      onPress: () =>
        navigate(SCREENS.PRIVACY_POLICY, {
          title: COMMON_TEXT.ABOUT_US,
        }),
    },
    {
      title: COMMON_TEXT.CONTACT_US,
      onPress: () => navigate(SCREENS.CONTACT_US),
    },
    {
      title: COMMON_TEXT.LOGOUT,
      onPress: () => {
        setIsDeleteSelected(false);
        setIsModalVisible(true);
      },
      color: COLORS.RED,
    },
    {
      title: 'Delete Account',
      onPress: () => {
        setIsDeleteSelected(true);
        setIsModalVisible(true);
      },
      color: COLORS.RED,
    },
  ];

  return (
    <Wrapper useScrollView useSafeArea={false} showAppLoader>
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
      <LogoutModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        isDelete={isDeleteSelected}
        onConfirm={() => handleAccount({ isDelete: isDeleteSelected })}
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
