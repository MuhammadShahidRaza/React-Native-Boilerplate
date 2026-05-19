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
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

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
    desc: 'Two smashed patties with cheddar cheese',
    price: 330,
    priceLabel: 'CFA 330',
    popular: true,
  },
  {
    id: '2',
    title: 'Loaded Fries',
    desc: 'Crispy fries with cheese sauce and jalapenos',
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

  return (
    <Wrapper
      headerTitle={name}
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
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
            <Photo source={IMAGES.RESTAURANT_ONE} imageStyle={styles.heroImg} resizeMode='cover' />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGrad} />
            <View style={styles.metaRow}>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName='star'
                size={14}
                color={COLORS.APP_STAR}
              />
              <Typography style={styles.metaTxt}>
                {`4.9 · 15-25 min · CFA 30 Delivery`}
              </Typography>
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
    </Wrapper>
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
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroImg: {
    ...StyleSheet.absoluteFill,
    width: undefined,
    height: undefined,
  },
  heroGrad: {
    ...StyleSheet.absoluteFill,
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
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.ExtraSmall,
    marginTop: 4,
  },
  price: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.Bold,
    marginTop: 8,
    fontSize: FontSize.Small,
  },
  popular: {
    position: 'absolute',
    top: 8,
    right: 88,
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
    minWidth: 52,
  },
});
