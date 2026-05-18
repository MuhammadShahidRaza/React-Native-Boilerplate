import { View, StyleSheet, ImageBackground } from 'react-native';
import { Button, Icon, MessageBox, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, VARIABLES, SCREENS, IMAGES } from 'constants/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { STYLES, COLORS, screenWidth, screenHeight } from 'utils/index';
import { navigate } from 'navigation/Navigators';
import { useAppSelector } from 'types/reduxTypes';
import { LogoutModal } from 'components/common/LogoutModal';
import { useState } from 'react';
import { handleAccountLogout } from './Settings';
import CustomSwitch from 'components/common/SwitchButton';
import { updateUserDetails } from 'api/functions/app/user';
import { APP_CONFIG, isWorkerRole } from 'config/app';

export const MyAccount = () => {
  const { userDetails } = useAppSelector(state => state?.user);
  const role = useAppSelector(state => state?.user?.role);

  const [isLogoutModalVisible, setisLogoutModalVisible] = useState(false);
  const [isProfilePaused, setIsProfilePaused] = useState(userDetails?.is_freezed == 1);
  const handlePauseProfile = async (value: boolean) => {
    setIsProfilePaused(value);
    await updateUserDetails(
      {
        is_freezed: value ? 1 : 0,
      },
      false,
    );
  };

  const tabs = [
    ...(isWorkerRole(role)
      ? [
          {
            title: 'My Account',
            iconName: 'support-agent',
            iconComponent: VARIABLES.MaterialIcons,
            onPress: () => navigate(SCREENS.COMPLETE_PROFILE, { isFromSettings: true }),
          },
        ]
      : []),
    ...(role === APP_CONFIG.USER_ROLE
      ? [
          {
            title: COMMON_TEXT.EDIT_PROFILE,
            iconName: 'user-circle',
            onPress: () => navigate(SCREENS.PROFILE),
            iconComponent: VARIABLES.FontAwesome,
          },
        ]
      : []),

    {
      title: COMMON_TEXT.SETTINGS,
      iconName: 'settings',
      onPress: () => navigate(SCREENS.SETTINGS),
      iconComponent: VARIABLES.Feather,
    },
    {
      title: COMMON_TEXT.CONTACT_US,
      iconName: 'support-agent',
      iconComponent: VARIABLES.MaterialIcons,
      onPress: () => navigate(SCREENS.CONTACT_US),
    },
    ...(isWorkerRole(role)
      ? [
          {
            title: 'My Wallet',
            iconName: 'support-agent',
            iconComponent: VARIABLES.MaterialIcons,
            onPress: () => navigate(SCREENS.MY_WALLET),
          },
        ]
      : []),
    // {
    //   title: "Transaction History",
    //   iconName: 'support-agent',
    //   iconComponent: VARIABLES.MaterialIcons,
    //   onPress: () => navigate(SCREENS.TRANSACTION_HISTORY),
    // },
    {
      title: COMMON_TEXT.LOGOUT,
      iconName: 'power',
      iconComponent: VARIABLES.Ionicons,
      onPress: () => {
        setisLogoutModalVisible(true);
      },
      style: {
        marginTop: isWorkerRole(role) ? 75 : 200,
        borderBottomWidth: 0,
      },
    },
  ];

  return (
    <Wrapper showBackButton={false} darkMode={false}>
      <ImageBackground
        source={IMAGES.MY_ACCOUNT_BACKGROUND}
        resizeMode='cover'
        style={styles.backgroundImage}
      >
        <MessageBox
          userImage={userDetails?.profile_image}
          userNameStyle={styles.userNameStyle}
          imageStyle={styles.userImageStyle}
          userName={userDetails?.full_name}
          hideBorder
          containerStyle={styles.messageContainer}
          message={userDetails?.email || ''}
          messageStyle={styles.messageStyle}
        />
      </ImageBackground>

      <View style={styles.tabsContainer}>
        <Typography style={styles.titleText}>{'My Account'}</Typography>
        {/* Pause Profile Toggle for Dentors */}
        {isWorkerRole(role) && (
          <RowComponent
            style={[
              styles.rowContainer,
              {
                ...STYLES.SHADOW,
                backgroundColor: COLORS.SURFACE,
                paddingVertical: 10,
                borderRadius: 10,
                borderBottomWidth: 0,
                marginVertical: 10,
              },
            ]}
          >
            <Button
              containerStyle={styles.buttonContainer}
              title={'Pause My Profile'}
              textStyle={{ ...styles.buttonText }}
              style={styles.button}
            />

            <CustomSwitch
              style={{ marginRight: 10 }}
              value={isProfilePaused}
              onValueChange={handlePauseProfile}
            />
          </RowComponent>
        )}

        {tabs.map(({ title, iconName, iconComponent, onPress, style }) => (
          <RowComponent style={[styles.rowContainer, style]} onPress={onPress} key={title}>
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
              color={COLORS.BORDER}
              iconStyle={{ marginRight: 10 }}
              size={FontSize.Large}
            />
          </RowComponent>
        ))}
      </View>
      <LogoutModal
        isVisible={isLogoutModalVisible}
        setIsVisible={setisLogoutModalVisible}
        isDelete={false}
        onConfirm={() => handleAccountLogout({ isDelete: false })}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: screenWidth(100),
    height: screenHeight(20),
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
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
    // ...STYLES.SHADOW,
  },
  userNameStyle: {
    color: COLORS.WHITE,
    textTransform: 'capitalize',
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumLarge,
  },
  messageStyle: {
    color: COLORS.WHITE,
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
  },
});
