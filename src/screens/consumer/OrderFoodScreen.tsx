import { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Pressable, Image } from 'react-native';
import { Icon, Photo, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

const CATS = ['All', 'Burgers', 'Pizza', 'Chinese'] as const;

const RESTAURANTS = [
  { id: '1', name: 'Retro Burger', cuisine: 'Fast Food', time: '15-25 min', fee: 'CFA 30', featured: false },
  { id: '2', name: 'The Grill House', cuisine: 'BBQ & Grills', time: '15-25 min', fee: 'CFA 30', featured: true },
  { id: '3', name: 'Noodle Bar', cuisine: 'Chinese', time: '20-30 min', fee: 'CFA 25', featured: true },
];

export const OrderFoodScreen = () => {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const [q, setQ] = useState('');

  return (
    <Wrapper
      headerTitle="Order Food"
      showBackButton
      backIconStyle={consumerBackIcon}
      useScrollView={false}
      darkMode={false}
    >
      <View style={styles.searchRow}>
        <Icon
          componentName={VARIABLES.Feather}
          iconName="search"
          size={FontSize.Medium}
          color={COLORS.APP_TEXT_MUTED}
        />
        <TextInput
          style={styles.search}
          placeholder="Search restaurants or cuisines..."
          placeholderTextColor={COLORS.APP_TEXT_MUTED}
          value={q}
          onChangeText={setQ}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {CATS.map(c => (
          <Pressable
            key={c}
            onPress={() => setCat(c)}
            style={[styles.chip, cat === c && styles.chipOn]}
          >
            <Typography style={[styles.chipTxt, cat === c && styles.chipTxtOn]}>{c}</Typography>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {RESTAURANTS.map(r => (
          <Pressable
            key={r.id}
            style={styles.restCard}
            onPress={() => navigate(SCREENS.RESTAURANT_MENU, { restaurantId: r.id, name: r.name })}
          >
            <View style={styles.imgWrap}>
              <Photo source={r.id === '1' ? IMAGES.RESTAURANT_ONE : IMAGES.RESTAURANT_TWO} imageStyle={styles.restImg} resizeMode="cover" />
              {r.featured && (
                <View style={styles.featured}>
                  <Typography style={styles.featuredTxt}>Featured</Typography>
                </View>
              )}
              <View style={styles.heart}>
                <Icon
                  componentName={VARIABLES.Feather}
                  iconName="heart"
                  size={FontSize.Medium}
                  color={COLORS.WHITE}
                />
              </View>
              <View style={styles.timeBadge}>
                <Icon
                  componentName={VARIABLES.Feather}
                  iconName="clock"
                  size={FontSize.ExtraSmall}
                  color={COLORS.APP_TEXT}
                />
                <Typography style={styles.timeTxt}>{r.time}</Typography>
              </View>
            </View>
            <View style={styles.restBody}>
              <View style={styles.rowBetween}>
                <Typography style={styles.restName}>{r.name}</Typography>
                <View style={styles.rating}>
                  <Icon
                    componentName={VARIABLES.Ionicons}
                    iconName="star"
                    size={FontSize.ExtraSmall}
                    color={COLORS.APP_STAR}
                  />
                  <Typography style={styles.ratingTxt}>4.9</Typography>
                </View>
              </View>
              <Typography style={styles.cuisine}>{r.cuisine}</Typography>
              <View style={styles.feeRow}>
                <Icon
                  componentName={VARIABLES.Feather}
                  iconName="navigation"
                  size={FontSize.ExtraSmall}
                  color={COLORS.APP_TEXT_MUTED}
                />
                <Typography style={styles.fee}>{`${r.fee} Delivery`}</Typography>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 12,
  },
  search: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT,
  },
  chipsScroll: {
    maxHeight: 44,
    paddingLeft: 12,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginRight: 8,
    backgroundColor: COLORS.WHITE,
  },
  chipOn: {
    backgroundColor: COLORS.APP_PRIMARY,
    borderColor: COLORS.APP_PRIMARY,
  },
  chipTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  chipTxtOn: {
    color: COLORS.WHITE,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  restCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
  },
  imgWrap: {
    height: 140,
    backgroundColor: COLORS.APP_MAP_BG,
  },
  restImg: {
    width: '100%',
    height: '100%',
  },
  featured: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.APP_PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredTxt: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.Bold,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTxt: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT,
  },
  restBody: {
    padding: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restName: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Large,
    color: COLORS.APP_TEXT,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingTxt: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  cuisine: {
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
    fontSize: FontSize.Small,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fee: {
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
});
