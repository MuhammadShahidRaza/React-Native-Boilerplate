import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Button,
  FilterChipRow,
  FlatListComponent,
  Icon,
  Input,
  RestaurantCard,
  Typography,
  ALL_RESTAURANT_CATEGORY,
  buildRestaurantCategoryOptions,
  filterRestaurants,
  type RestaurantItem,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/index';
import { useFavoriteRestaurants } from 'hooks/useFavoriteRestaurants';
import { useRestaurantCatalog } from 'hooks/useRestaurantCatalog';
import { getCurrentLocation } from 'utils/location';
import { updateUserLocation } from 'api/functions/app/user';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { setUserDetails } from 'store/slices/user';

type RestaurantBrowseListProps = {
  /** When true, only restaurants the user has hearted are shown. */
  favoritesOnly?: boolean;
};

export const RestaurantBrowseList = ({ favoritesOnly = false }: RestaurantBrowseListProps) => {
  const [category, setCategory] = useState(ALL_RESTAURANT_CATEGORY);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const { restaurants, loading, refreshing, refresh, locationMissing } = useRestaurantCatalog();
  const { likedIds, toggleLike } = useFavoriteRestaurants();
  const dispatch = useAppDispatch();
  const userDetails = useAppSelector(state => state.user.userDetails);

  const handleAllowLocation = async () => {
    setLocating(true);
    const pos = await getCurrentLocation();
    if (pos && userDetails) {
      const { latitude, longitude } = pos.coords;
      updateUserLocation(latitude, longitude);
      dispatch(setUserDetails({ ...userDetails, latitude, longitude }));
    }
    setLocating(false);
  };

  const sourceList = useMemo(() => {
    if (!favoritesOnly) return restaurants;
    return restaurants.filter(r => likedIds.has(r.id));
  }, [favoritesOnly, restaurants, likedIds]);

  const categoryOptions = useMemo(
    () => buildRestaurantCategoryOptions(sourceList),
    [sourceList],
  );

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(ALL_RESTAURANT_CATEGORY);
    }
  }, [categoryOptions, category]);

  const filtered = useMemo(
    () => filterRestaurants(sourceList, category, query),
    [sourceList, category, query],
  );

  const openRestaurant = useCallback((r: RestaurantItem) => {
    const imageUri = typeof r.image === 'object' && r.image && 'uri' in r.image ? r.image.uri : undefined;
    navigate(SCREENS.RESTAURANT_MENU, {
      restaurantId: r.id,
      name: r.name,
      cuisine: r.cuisine,
      time: r.time,
      rating: r.rating,
      distanceLabel: r.distanceLabel,
      distanceKm: r.distanceKm,
      imageUri,
    });
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
          iconName={favoritesOnly ? 'heart' : 'search'}
          size={40}
          color={COLORS.APP_TEXT_MUTED}
        />
        <Typography style={styles.emptyTitle}>
          {favoritesOnly ? 'No favorite restaurants' : 'No restaurants found'}
        </Typography>
        <Typography style={styles.emptySub}>
          {favoritesOnly
            ? 'Tap the heart on Order Food to save restaurants here'
            : 'Try another category or search term'}
        </Typography>
      </View>
    ),
    [favoritesOnly],
  );

  if (locationMissing) {
    return (
      <View style={styles.locationGate}>
        <Icon
          componentName={VARIABLES.MaterialCommunityIcons}
          iconName='map-marker-off'
          size={52}
          color={COLORS.APP_TEXT_MUTED}
        />
        <Typography style={styles.locationGateTitle}>Location Required</Typography>
        <Typography style={styles.locationGateSub}>
          We need your location to show nearby restaurants
        </Typography>
        <Button
          title='Allow Location'
          onPress={handleAllowLocation}
          loading={locating}
          style={styles.locationGateBtn}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.searchWrap}>
        <Input
          name={favoritesOnly ? 'favoriteFoodSearch' : 'foodSearch'}
          placeholder={
            favoritesOnly ? 'Search your favorites...' : 'Search restaurants or cuisines...'
          }
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
          options={categoryOptions}
          value={category}
          onChange={next => {
            setCategory(next);
            Keyboard.dismiss();
          }}
        />
      </View>

      <FlatListComponent
        data={loading && !refreshing ? [] : filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        scrollEnabled={!loading || refreshing}
        contentContainerStyle={
          loading && !refreshing
            ? styles.listContent
            : filtered.length === 0
              ? styles.listEmpty
              : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        EmptyComponent={loading && !refreshing ? RestaurantListSkeleton : ListEmpty}
        onRefresh={refresh}
        refreshing={refreshing}
        extraData={likedIds}
      />
    </View>
  );
};

const RestaurantListSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    {[0, 1, 2, 3].map(i => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonPlaceholder.Item width='100%' height={140} borderRadius={16} />
        <SkeletonPlaceholder.Item
          width='68%'
          height={18}
          borderRadius={6}
          marginTop={12}
          marginLeft={10}
        />
        <SkeletonPlaceholder.Item
          width='42%'
          height={14}
          borderRadius={6}
          marginTop={8}
          marginLeft={10}
        />
        <SkeletonPlaceholder.Item
          width='36%'
          height={14}
          borderRadius={6}
          marginTop={8}
          marginLeft={10}
          marginBottom={4}
        />
      </View>
    ))}
  </SkeletonPlaceholder>
);

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
  locationGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  locationGateTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginTop: 12,
    textAlign: 'center',
  },
  locationGateSub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  locationGateBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    alignSelf: 'center',
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
    paddingHorizontal: 24,
  },
  skeletonCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 16,
    padding: 8,
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
  },
});
