import { useEffect } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Icon, MessageBox, RowComponent } from 'components/common';
import { STYLES } from 'utils/commonStyles';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import {
  greetings,
  isIOS,
  safeNumber,
  screenHeight,
  screenWidth,
  getUserAddressString,
} from 'utils/helpers';
import { COLORS } from 'utils/colors';
import { useAppSelector } from 'types/reduxTypes';
import { VARIABLES } from 'constants/common';
import { FontSize } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { useCurrentLocation } from 'hooks/useCurrentLocation';
import { isWorkerRole } from 'config/app';

export const HomeHeader = () => {
  const { userDetails } = useAppSelector(state => state?.user);
  const role = useAppSelector(state => state?.user?.role);
  const { currentAddress, loadCurrentLocation } = useCurrentLocation();

  useEffect(() => {
    const userAddr = getUserAddressString(userDetails?.address);
    if (!userAddr && !currentAddress) {
      loadCurrentLocation();
    }
  }, [userDetails?.address, currentAddress, loadCurrentLocation]);

  // Get location string for dentor role
  const getLocationString = () => {
    if (!userDetails) return greetings();
    const locationParts = [
      userDetails?.details?.city,
      userDetails?.details?.state,
      userDetails?.details?.country,
    ].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : greetings() || '';
  };

  const displayImage =
    isWorkerRole(role) ? IMAGES.LOCATION_ICON : userDetails?.profile_image;
  const displayName =
    isWorkerRole(role) ? 'Location' : (userDetails?.full_name ?? 'Guest');
  const userAddr = getUserAddressString(userDetails?.address);
  const displayMessage = isWorkerRole(role)
    ? getLocationString()
    : userAddr || currentAddress?.fullAddress || '';

  return (
    <ImageBackground
      source={IMAGES.MY_ACCOUNT_BACKGROUND}
      resizeMode='cover'
      style={styles.headerContainer}
    >
      <RowComponent style={STYLES.CONTAINER}>
        <MessageBox
          onPress={() => {
            if (isWorkerRole(role)) {
              navigate(SCREENS.VEHICLE_DETAILS, { isFromSettings: true });
            } else {
              navigate(SCREENS.LOCATION);
            }
          }}
          containerStyle={styles.messageBoxContainer}
          userImage={displayImage}
          imageStyle={styles.messageImageStyle}
          hideBorder={true}
          userNameStyle={styles.userNameStyle}
          messageStyle={styles.messageStyle}
          userName={displayName || ''}
          message={displayMessage}
        />
        <RowComponent style={styles.iconContainer}>
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
            {safeNumber(userDetails?.notification_unread_count) > 0 && (
              <View style={styles.notificationDot} />
            )}
          </View>
        </RowComponent>
      </RowComponent>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomLeftRadius: 20,
    height: screenHeight(isIOS() ? 13 : 10),
    justifyContent: 'flex-end',
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  messageBoxContainer: {
    width: screenWidth(60),
    marginHorizontal: 0,
  },
  userNameStyle: {
    color: COLORS.WHITE,
    textTransform: 'capitalize',
  },
  iconStyle: {
    backgroundColor: COLORS.SURFACE,
    padding: 6,
    borderRadius: 6,
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
  iconContainer: {
    ...STYLES.GAP_15,
  },
  messageStyle: {
    color: COLORS.TEXT_INVERSE,
  },
  messageImageStyle: {
    borderRadius: 40,
    borderWidth: 0,
  },
});
