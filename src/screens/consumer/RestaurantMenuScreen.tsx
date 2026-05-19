import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  FoodCartBar,
  Icon,
  MenuItemQuantityControl,
  Photo,
  Typography,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CustomBackIcon, navigate, onBack } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS, screenHeight, screenWidth } from 'utils/index';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

type MenuItem = {
  id: string;
  title: string;
  desc: string;
  price: number;
  priceLabel: string;
  popular: boolean;
};

const ITEMS: MenuItem[] = [
  {
    id: '1',
    title: 'Double Smash Burger',
    desc: 'Two smashed patties with cheddar cheese and lettuce',
    price: 330,
    priceLabel: 'CFA 330',
    popular: true,
  },
  {
    id: '2',
    title: 'Loaded Fries',
    desc: 'Crispy fries with cheese sauce and jalapenos and lettuce',
    price: 330,
    priceLabel: 'CFA 330',
    popular: false,
  },
];

export const RestaurantMenuScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.RESTAURANT_MENU>>();
  const name = route.params?.name ?? 'Restaurant';
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const increment = (id: string) => {
    setQtys(q => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setQtys(q => {
      const next = (q[id] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...q };
        delete copy[id];
        return copy;
      }
      return { ...q, [id]: next };
    });
  };

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    ITEMS.forEach(item => {
      const qty = qtys[item.id] ?? 0;
      if (qty > 0) {
        count += qty;
        total += item.price * qty;
      }
    });
    return { cartCount: count, cartTotal: total };
  }, [qtys]);

  const cartTotalLabel = `CFA ${cartTotal.toLocaleString()}`;

  // Wrapper
  // headerTitle={name}
  // showBackButton={false}
  // backIconStyle={BACK_ICON_STYLE}
  // useScrollView={false}
  // backgroundColor={COLORS.WHITE}
  // darkMode={false}
  return (
    <>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            cartCount > 0 && styles.scrollContentWithCart,
          ]}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.hero}>
            <CustomBackIcon
              onPress={() => onBack()}
              style={[BACK_ICON_STYLE, { position: 'absolute', top: 50, left: 16, zIndex: 1 }]}
            />
            <Photo source={IMAGES.RESTAURANT_ITEM_3} imageStyle={styles.heroImg} />
            {/* <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGrad} /> */}
            <View
              style={{
                position: 'absolute',
                bottom: 40,
                left: 25,
                right: 0,
                zIndex: 1,
              }}
            >
              <Typography style={styles.heroTitle}>{name}</Typography>
              <Typography style={styles.heroSubtitle}>Fast Food</Typography>
              <View style={styles.metaRow}>
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName='star'
                  size={14}
                  color={COLORS.APP_STAR}
                />
                <Typography
                  style={styles.metaTxt}
                >{`4.9 · 15-25 min · CFA 30 Delivery`}</Typography>
              </View>
            </View>
          </View>

          {ITEMS.map(item => {
            const qty = qtys[item.id] ?? 0;
            return (
              <View key={item.id} style={styles.itemCard}>
                <Photo
                  source={IMAGES.RESTAURANT_TWO}
                  size={72}
                  borderRadius={10}
                  imageStyle={styles.thumb}
                />
                <View style={styles.itemInfo}>
                  <Typography style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Typography>
                  <Typography style={styles.itemDesc} numberOfLines={2}>
                    {item.desc}
                  </Typography>
                  <Typography style={styles.price}>{item.priceLabel}</Typography>
                </View>

                {item.popular ? (
                  <View style={styles.popular} pointerEvents='none'>
                    <Icon
                      componentName={VARIABLES.MaterialCommunityIcons}
                      iconName='fire'
                      size={12}
                      color='#C2410C'
                    />
                    <Typography style={styles.popularTxt}>Popular</Typography>
                  </View>
                ) : null}

                <View style={styles.qtyCol}>
                  <MenuItemQuantityControl
                    quantity={qty}
                    onIncrement={() => increment(item.id)}
                    onDecrement={() => decrement(item.id)}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>

        <FoodCartBar
          itemCount={cartCount}
          totalLabel={cartTotalLabel}
          onPress={() => navigate(SCREENS.FOOD_DELIVERY_CART)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentWithCart: {
    paddingBottom: 8,
  },
  hero: {
    height: screenHeight(40),
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    // padding: 16,
  },
  heroSubtitle: {
    color: COLORS.WHITE,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    marginBottom: 5,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroGrad: {
    // ...StyleSheet.absoluteFill,
  },
  heroTitle: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 4,
  },
  itemTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.Medium,
  },
  itemDesc: {
    color: COLORS.APP_TEXT_SMALL,
    fontSize: FontSize.Small,
    maxWidth: 150,
  },
  price: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.Bold,
  },
  popular: {
    position: 'absolute',
    top: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
  qtyCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    alignSelf: 'flex-end',
  },
});
