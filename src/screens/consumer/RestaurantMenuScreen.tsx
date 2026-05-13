import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper, Photo, RowComponent, GradientButton } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RootStackParamList } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';
import { CustomBackIcon } from 'navigation/index';

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
  // Per-item qty: 0 = not added, >0 = qty in cart
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const increment = (id: string) => setQtys(q => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  const decrement = (id: string) =>
    setQtys(q => {
      const next = (q[id] ?? 1) - 1;
      if (next <= 0) {
        const copy = { ...q };
        delete copy[id];
        return copy;
      }
      return { ...q, [id]: next };
    });

  return (
    <Wrapper
      headerTitle={name}
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
      headerEndIcon={() => (
        <CustomBackIcon
          onPress={() => {}}
          style={[consumerBackIcon, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
        />
      )}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Photo source={IMAGES.USER} imageStyle={styles.heroImg} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGrad} />
          <View style={styles.metaRow}>
            <Icon componentName={VARIABLES.Ionicons} iconName="star" size={14} color={COLORS.APP_STAR} />
            <Typography style={styles.metaTxt}>4.9</Typography>
            <Typography style={styles.metaTxt}> · 15-25 min</Typography>
            <Typography style={styles.metaTxt}> · CFA 30 Delivery</Typography>
          </View>
        </View>

        {ITEMS.map(item => {
          const qty = qtys[item.id] ?? 0;
          return (
            <View key={item.id} style={styles.itemCard}>
              <Photo source={IMAGES.USER} size={72} borderRadius={10} imageStyle={styles.thumb} />
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
                  <Icon componentName={VARIABLES.MaterialCommunityIcons} iconName="fire" size={12} color="#C2410C" />
                  <Typography style={styles.popularTxt}> Popular</Typography>
                </View>
              )}
              {qty === 0 ? (
                <GradientButton
                  title="+ Add"
                  onPress={() => increment(item.id)}
                  style={styles.addBtnWrap}
                  gradientStyle={styles.addBtn}
                  textStyle={styles.addTxt}
                />
              ) : (
                <RowComponent style={styles.qtyControl}>
                  <View style={styles.qtyMinus}>
                    <Icon
                      componentName={VARIABLES.Feather}
                      iconName="minus"
                      size={FontSize.Small}
                      color={COLORS.APP_PRIMARY}
                      onPress={() => decrement(item.id)}
                    />
                  </View>
                  <Typography style={styles.qtyVal}>{String(qty).padStart(2, '0')}</Typography>
                  <View style={styles.qtyPlus}>
                    <Icon
                      componentName={VARIABLES.Feather}
                      iconName="plus"
                      size={FontSize.Small}
                      color={COLORS.WHITE}
                      onPress={() => increment(item.id)}
                    />
                  </View>
                </RowComponent>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'flex-end',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 10,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addTxt: {
    fontSize: FontSize.Small,
  },
  qtyControl: {
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  qtyMinus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    minWidth: 20,
    textAlign: 'center',
  },
  qtyPlus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.APP_PRIMARY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
