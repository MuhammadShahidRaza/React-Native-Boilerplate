import { StyleSheet, View } from 'react-native';
import { Icon, MessageBox, RowComponent, Wrapper } from 'components/index';
import { screenHeight, screenWidth, STYLES, COLORS, greetings, safeNumber } from 'utils/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { FontSize, useAppSelector } from 'types/index';
import { navigate } from 'navigation/index';

export const Home = () => {
  const { userDetails } = useAppSelector(state => state?.user);
  return (
    <Wrapper backgroundColor={COLORS.PRIMARY} darkMode={false}>
      <View style={styles.headerContainer}>
        <RowComponent style={STYLES.CONTAINER}>
          <MessageBox
            onPress={() => {
              navigate(SCREENS.PROFILE);
            }}
            containerStyle={styles.messageBoxContainer}
            userImage={userDetails?.profile_image}
            imageStyle={styles.messageImageStyle}
            hideBorder={true}
            userNameStyle={styles.userNameStyle}
            messageStyle={styles.messageStyle}
            userName={userDetails?.full_name}
            message={greetings()}
          />
          <RowComponent style={styles.iconContainer}>
            <Icon
              onPress={() => {
                navigate(SCREENS.CART);
              }}
              iconName={'cart-variant'}
              componentName={VARIABLES.MaterialCommunityIcons}
              size={FontSize.ExtraLarge}
              iconStyle={styles.iconStyle}
              color={COLORS.PRIMARY}
            />
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
          </RowComponent>
        </RowComponent>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomLeftRadius: 50,
    height: screenHeight(29),
    borderBottomRightRadius: 50,
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
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.ICONS,
  },
  messageImageStyle: {
    borderRadius: 5,
  },
});
