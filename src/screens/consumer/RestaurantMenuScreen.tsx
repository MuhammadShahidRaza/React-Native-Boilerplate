import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  FoodCartBar,
  Icon,
  MenuItemQuantityControl,
  Photo,
  Typography,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CustomBackIcon, navigate, onBack } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS, screenHeight, formatMoney } from 'utils/index';
import {
  getRestaurantMenuAll,
  isMenuItemPopular,
} from 'api/functions/snlift/restaurants';
import { parseMoneyAmount } from 'utils/currency';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import {
  setCartRestaurant,
  upsertItem,
  decrementItem,
} from 'store/slices/foodCart';

type MenuItem = {
  id: string;
  title: string;
  desc: string;
  price: number;
  priceLabel: string;
  popular: boolean;
  imageUri?: string | null;
};

export const RestaurantMenuScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.RESTAURANT_MENU>>();
  const name = route.params?.name ?? 'Restaurant';
  const restaurantId = route?.params?.restaurantId;
  const cuisine = route.params?.cuisine;
  const time = route.params?.time;
  const rating = route.params?.rating;
  const distanceLabel = route.params?.distanceLabel;
  const distanceKm = route.params?.distanceKm;
  const heroImage = route.params?.imageUri
    ? { uri: route.params.imageUri }
    : IMAGES.RESTAURANT_ITEM_3;

  const metaParts = [rating, time, distanceLabel].filter(Boolean);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const cartState = useAppSelector(s => s.foodCart);

  useEffect(() => {
    if (!restaurantId) return;
    if (cartState.restaurantId === restaurantId) return;

    if (cartState.items.length > 0) {
      Alert.alert(
        'Switch Restaurant?',
        `You have items from "${cartState.restaurantName}" in your cart. Switching will clear your cart.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => onBack() },
          {
            text: 'Switch',
            style: 'destructive',
            onPress: () =>
              dispatch(
                setCartRestaurant({
                  restaurantId,
                  restaurantName: name,
                  restaurantDistanceKm: distanceKm,
                }),
              ),
          },
        ],
      );
    } else {
      dispatch(
        setCartRestaurant({
          restaurantId,
          restaurantName: name,
          restaurantDistanceKm: distanceKm,
        }),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getRestaurantMenuAll(restaurantId)
      .then(apiItems => {
        if (cancelled) return;
        const mapped: MenuItem[] = apiItems.map(m => {
          const price = parseMoneyAmount(m.price) ?? 0;
          return {
            id: String(m.id),
            title: m.name ?? m.title ?? 'Item',
            desc: m.description ?? '',
            price,
            priceLabel: formatMoney(price),
            popular: isMenuItemPopular(m),
            imageUri: m.image,
          };
        });
        setItems(mapped);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const qtys = useMemo(
    () => Object.fromEntries(cartState.items.map(i => [i.id, i.qty])),
    [cartState.items],
  );

  const increment = (item: MenuItem) => {
    dispatch(
      upsertItem({
        id: item.id,
        menuItemId: Number(item.id),
        title: item.title,
        price: item.price,
        imageUri: item.imageUri,
      }),
    );
  };

  const decrement = (id: string) => {
    dispatch(decrementItem(id));
  };

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    cartState.items.forEach(i => {
      count += i.qty;
      total += i.price * i.qty;
    });
    return { cartCount: count, cartTotal: total };
  }, [cartState.items]);

  const cartTotalLabel = formatMoney(cartTotal);

  // Wrapper
  // headerTitle={name}
  // showBackButton={false}
  //
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
              style={[{ position: 'absolute', top: 50, left: 16, zIndex: 1 }]}
            />
            <Photo source={heroImage} imageStyle={styles.heroImg} />
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
              {cuisine ? (
                <Typography style={styles.heroSubtitle}>{cuisine}</Typography>
              ) : null}
              {metaParts.length > 0 ? (
                <View style={styles.metaRow}>
                  {rating ? (
                    <Icon
                      componentName={VARIABLES.Ionicons}
                      iconName='star'
                      size={14}
                      color={COLORS.APP_STAR}
                    />
                  ) : null}
                  <Typography style={styles.metaTxt}>{metaParts.join(' · ')}</Typography>
                </View>
              ) : null}
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size='large' color={COLORS.APP_PRIMARY} />
              <Typography style={styles.loaderTxt}>Loading menu...</Typography>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon
                componentName={VARIABLES.Feather}
                iconName='coffee'
                size={40}
                color={COLORS.APP_TEXT_MUTED}
              />
              <Typography style={styles.emptyTxt}>No menu items available</Typography>
            </View>
          ) : (
            items.map(item => {
            const qty = qtys[item.id] ?? 0;
            return (
              <View key={item.id} style={styles.itemCard}>
                <Photo
                  source={item.imageUri ? { uri: item.imageUri } : IMAGES.RESTAURANT_TWO}
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
                    onIncrement={() => increment(item)}
                    onDecrement={() => decrement(item.id)}
                  />
                </View>
              </View>
            );
          })
          )}
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
    backgroundColor: COLORS.BACKGROUND,
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
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loaderTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
    textAlign: 'center',
  },
});
