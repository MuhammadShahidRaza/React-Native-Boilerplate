import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SCREENS, VARIABLES} from 'constants/index';
import {COLORS} from 'utils/colors';
import {Icon} from 'components/common';
import {View, StyleSheet} from 'react-native';
import {FontSize} from 'types/fontTypes';
import {isIOS, screenHeight} from 'utils/index';
import { Chat, Home} from 'screens/user';
import {useTranslation} from 'hooks/useTranslation';

const screens = {
  [SCREENS.HOME]: Home,
  [SCREENS.CHAT]: Chat,
};

const getIconConfig = (routeName: string) => {
  switch (routeName) {
    case SCREENS.HOME:
      return {iconName: 'home', componentName: VARIABLES.Entypo};
    case SCREENS.SEARCH_PRACTITIONERS:
      return {iconName: 'map', componentName: VARIABLES.MaterialCommunityIcons};
    case SCREENS.CHAT:
      return {
        iconName: 'chatbox-ellipses',
        componentName: VARIABLES.Ionicons,
        iconStyle: {transform: [{scaleX: -1}]},
      };
    case SCREENS.APPOINTMENTS:
      return {iconName: 'calendar-alt', componentName: VARIABLES.FontAwesome5};
    default:
      return {iconName: 'person', componentName: VARIABLES.AntDesign};
  }
};

export const BottomNavigator = () => {
  const {isLangRTL} = useTranslation();
  const Bottom = createBottomTabNavigator();

  const renderedPages = isLangRTL
    ? // ? Object.entries(screens).reverse()
      Object.entries(screens)
    : Object.entries(screens);

  return (
    <Bottom.Navigator
      screenOptions={({route}) => {
        const {iconName, componentName, iconStyle} = getIconConfig(route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.WHITE,
            height: screenHeight(isIOS() ? 8 : 6.5),
            paddingTop: 15,
          },
          tabBarLabel: '',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({focused}) => (
            <View style={styles.iconContainer}>
              <Icon
                iconName={iconName}
                componentName={componentName}
                size={FontSize.Large}
                iconStyle={iconStyle}
                color={focused ? COLORS.PRIMARY : COLORS.BLACK}
              />
              <View
                style={[
                  styles.indicator,
                  {backgroundColor: focused ? COLORS.PRIMARY : COLORS.BLACK},
                ]}
              />
            </View>
          ),
        };
      }}>
      {renderedPages.map(([screenName, component]) => (
        <Bottom.Screen
          key={screenName}
          name={screenName}
          component={component}
        />
      ))}
    </Bottom.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
  },
  indicator: {
    height: 10,
    width: 10,
    marginTop: 10,
    borderRadius: 10,
  },
});
