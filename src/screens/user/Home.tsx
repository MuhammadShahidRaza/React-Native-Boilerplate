import { StyleSheet, View } from 'react-native';
import { HomeComponent, Icon, MessageBox, RowComponent, Wrapper } from 'components/index';
import { screenHeight, screenWidth, STYLES, COLORS } from 'utils/index';
import { IMAGES } from 'constants/assets';
import { COMMON_TEXT, SCREENS, TEMPORARY_TEXT, VARIABLES } from 'constants/index';
import { FontSize } from 'types/index';
import { navigate } from 'navigation/index';

export const Home = () => {
  return (
    <Wrapper backgroundColor={COLORS.PRIMARY} darkMode={false}>
      <View style={styles.headerContainer}>
        <RowComponent style={STYLES.CONTAINER}>
          <MessageBox
            onPress={() => {
              navigate(SCREENS.PROFILE);
            }}
            containerStyle={styles.messageBoxContainer}
            userImage={IMAGES.USER}
            imageStyle={styles.messageImageStyle}
            hideBorder={true}
            userNameStyle={styles.userNameStyle}
            messageStyle={styles.messageStyle}
            userName={TEMPORARY_TEXT.JOHN_DOE}
            message={COMMON_TEXT.NEED_A_HELP}
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
              <View style={styles.notificationDot} />
            </View>
          </RowComponent>
        </RowComponent>
        <HomeComponent />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomLeftRadius: 50,
    height: screenHeight(30),
    borderBottomRightRadius: 50,
  },
  messageBoxContainer: {
    width: screenWidth(60),
    marginHorizontal: 0,
  },
  userNameStyle: {
    color: COLORS.WHITE,
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
