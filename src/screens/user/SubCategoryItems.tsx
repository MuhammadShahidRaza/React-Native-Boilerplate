import { useEffect, useState } from 'react';
import { COLORS, STYLES } from 'utils/index';
import { renderHorizontalItemsWithRow, SearchBar, Wrapper } from 'components/index';
import {
  AppScreenProps,
  CATEGORY_NAMES,
  CategoryNameTypes,
  FontSize,
  useAppSelector,
} from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { Autocomplete } from 'components/common/Autocomplete';
import { AddressDetails } from 'utils/location';
import { navigate } from 'navigation/index';
// import { getMainCategoriesHomeItems } from 'api/functions/app/home';

export const SubCategoryItems = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_ITEMS>) => {
  const data = route?.params?.data;
  const selectedCategory = data?.item;
  const { categoriesList } = useAppSelector(state => state.category);
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<AddressDetails | null>(null);
  const [search, setSearch] = useState('');
  const activeCategory =
    categoriesList
      ?.find(cat => cat.subcategories?.some(sub => sub.id === selectedCategory?.id))
      ?.subcategories?.find(sub => sub.id === selectedCategory?.id) || null;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.heading,
    });
    // const typesToFetch = [FILTER_NAMES.NEAR_BY, FILTER_NAMES.TRENDING];
    // typesToFetch.forEach(type => {
    //   getMainCategoriesHomeItems({
    //     id: selectedCategory?.id,
    //     page: 1,
    //     type,
    //   });
    // });
  }, []);

  const hasItems =
    (activeCategory?.trending?.length ?? 0) > 0 || (activeCategory?.nearby?.length ?? 0) > 0;

  const filterableCategoriesForSearch = [
    CATEGORY_NAMES.HOTELS,
    CATEGORY_NAMES.SHORTLET,
    CATEGORY_NAMES.REAL_ESTATE,
  ] as readonly CategoryNameTypes[];

  return (
    <Wrapper useSafeArea={false} useScrollView={true}>
      {data?.heading === CATEGORY_NAMES.HOTELS && (
        <Autocomplete
          containerStyle={STYLES.CONTAINER}
          setReverseGeocodedAddress={setReverseGeocodedAddress}
          placeholder={'Enter Your Destination'}
          startIcon={{
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'map-marker-distance',
            color: COLORS.SECONDARY,
            size: FontSize.ExtraLarge,
          }}
        />
      )}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
        {...(filterableCategoriesForSearch.includes(data?.heading) && {
          endIcon: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'filter-variant',
            color: COLORS.PRIMARY,
            onPress: () => {
              navigate(SCREENS.FILTER, {
                data: {
                  heading: data?.heading,
                },
              });
            },
            size: FontSize.ExtraLarge,
          },
        })}
      />

      {hasItems && activeCategory && (
        <>
          {activeCategory?.nearby?.length > 0 &&
            renderHorizontalItemsWithRow({
              data: activeCategory.nearby,
              heading: data.heading,
              rowHeading: `Near By ${data.heading}`,
            })}

          {activeCategory?.trending?.length > 0 &&
            renderHorizontalItemsWithRow({
              data: activeCategory.trending,
              heading: data?.heading,
              rowHeading: `Trending ${data?.heading}`,
            })}
        </>
      )}
    </Wrapper>
  );
};
