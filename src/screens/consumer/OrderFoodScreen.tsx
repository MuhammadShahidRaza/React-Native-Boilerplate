import { useCallback, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import {
  FilterChipRow,
  FlatListComponent,
  FOOD_CATEGORIES,
  FOOD_RESTAURANTS,
  Icon,
  Input,
  RestaurantCard,
  Typography,
  Wrapper,
  filterRestaurants,
  type FoodCategory,
  type RestaurantItem,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/index';

 
export const OrderFoodScreen = () => {
  const [category, setCategory] = useState<FoodCategory>('All');
  const [query, setQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(
    () => filterRestaurants(FOOD_RESTAURANTS, category, query),
    [category, query],
  );

  const toggleLike = useCallback((id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openRestaurant = useCallback((r: RestaurantItem) => {
    navigate(SCREENS.RESTAURANT_MENU, { restaurantId: r.id, name: r.name });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: RestaurantItem }) => (
      <RestaurantCard
        restaurant={item}
        isLiked={likedIds.has(item.id)}
        onPress={() => openRestaurant(item)}
        onToggleLike={() => toggleLike(item.id)}
      />
    ),
    [likedIds, openRestaurant, toggleLike],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.empty}>
        <Icon
          componentName={VARIABLES.Feather}
          iconName='search'
          size={40}
          color={COLORS.APP_TEXT_MUTED}
        />
        <Typography style={styles.emptyTitle}>No restaurants found</Typography>
        <Typography style={styles.emptySub}>Try another category or search term</Typography>
      </View>
    ),
    [],
  );

  return (
    <Wrapper
      headerTitle='Order Food'
      showBackButton
       
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.root}>
        <View style={styles.searchWrap}>
          <Input
            name='foodSearch'
            placeholder='Search restaurants or cuisines...'
            value={query}
            onChangeText={setQuery}
            returnKeyType='search'
            allowSpacing
            containerStyle={styles.searchInput}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'search',
              size: FontSize.Medium,
              color: COLORS.APP_TEXT_MUTED,
            }}
          />
        </View>

        <View style={styles.filterWrap}>
          <FilterChipRow
            options={FOOD_CATEGORIES}
            value={category}
            onChange={next => {
              Keyboard.dismiss();
              setCategory(next);
            }}
          />
        </View>

        <FlatListComponent
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={styles.list}
          scrollEnabled
          contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          EmptyComponent={ListEmpty}
          extraData={likedIds}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterWrap: {
    zIndex: 2,
    backgroundColor: COLORS.WHITE,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginTop: 8,
  },
  emptySub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
  },
});
