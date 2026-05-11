import { ScrollView, StyleSheet, View, Image, Pressable } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import { IMAGES } from 'constants/assets';
import { COLORS, APP_GRADIENT_PRIMARY } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

const ITEMS = [
  { id: '1', title: 'Double Smash Burger', desc: 'Two Smashed Patties With Cheddar Cheese', price: 'CFA 330', popular: true },
  { id: '2', title: 'Loaded Fries', desc: 'Crispy fries with cheese sauce and jalapenos', price: 'CFA 330', popular: false },
];

export const RestaurantMenuScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.RESTAURANT_MENU>>();
  const name = route.params?.name ?? 'Restaurant';

  return (
    <Wrapper
      headerTitle={name}
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
      headerEndIcon={() => (
        <Pressable style={styles.favBtn}>
          <Icon componentName={VARIABLES.Feather} iconName="heart" size={FontSize.Medium} color={COLORS.WHITE} />
        </Pressable>
      )}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={IMAGES.USER} style={styles.heroImg} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGrad} />
          <View style={styles.metaRow}>
            <Icon componentName={VARIABLES.Ionicons} iconName="star" size={14} color={COLORS.APP_STAR} />
            <Typography style={styles.metaTxt}>4.9</Typography>
            <Typography style={styles.metaTxt}> · 15-25 min</Typography>
            <Typography style={styles.metaTxt}> · CFA 30 Delivery</Typography>
          </View>
        </View>

        {ITEMS.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={IMAGES.USER} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Typography style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Typography>
              <Typography style={styles.itemDesc} numberOfLines={2}>
                {item.desc}
              </Typography>
              <Typography style={styles.price}>{item.price}</Typography>
            </View>
            {item.popular && (
              <View style={styles.popular}>
                <Typography style={styles.popularTxt}>Popular</Typography>
              </View>
            )}
            <Pressable
              onPress={() => navigate(SCREENS.FOOD_DELIVERY_CART)}
              style={styles.addBtnWrap}
            >
              <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.addBtn}>
                <Typography style={styles.addTxt}>+ Add</Typography>
              </LinearGradient>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 220,
    marginHorizontal: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroImg: {
    ...StyleSheet.absoluteFill,
  },
  heroGrad: {
    ...StyleSheet.absoluteFill,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  metaTxt: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
  },
  itemCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 12,
    position: 'relative',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  itemTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.Medium,
  },
  itemDesc: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.ExtraSmall,
    marginTop: 4,
  },
  price: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.Bold,
    marginTop: 8,
  },
  popular: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularTxt: {
    fontSize: FontSize.ExtraSmall,
    color: '#C2410C',
    fontWeight: FontWeight.Bold,
  },
  addBtnWrap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
});
