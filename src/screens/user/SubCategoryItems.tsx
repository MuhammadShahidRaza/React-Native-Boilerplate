import { useEffect } from 'react';
import { renderHorizontalItemsWithRow, Wrapper } from 'components/index';
import { AppScreenProps, CATEGORY_NAMES, CategoryNameTypes, useAppSelector } from 'types/index';
import { SCREENS } from 'constants/index';
// import { getMainCategoriesHomeItems } from 'api/functions/app/home';

export const SubCategoryItems = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_ITEMS>) => {
  const data = route?.params?.data;
  const selectedCategory = data?.item;
  const { categoriesList } = useAppSelector(state => state.category);
  // const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<AddressDetails | null>(null);
  const activeCategory =
    categoriesList
      ?.find(cat => cat.subcategories?.some(sub => sub.id === selectedCategory?.id))
      ?.subcategories?.find(sub => sub.id === selectedCategory?.id) || null;

  // const [isItemFlow, setIsItemFlow] = useState(
  //   activeCategory?.business_flow?.slug === BUSINESS_FLOW_SLUGS.TICKET_PURCHASE,
  // );

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

  const showHeading = (heading: string) => {
    switch (heading) {
      case CATEGORY_NAMES.SPA:
        return 'Stores';
      default:
        return heading;
    }
  };

  return (
    <Wrapper useSafeArea={false} useScrollView={true}>
      {/* {data?.heading === CATEGORY_NAMES.HOTELS && (
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
      /> */}

      {hasItems && activeCategory && (
        <>
          {activeCategory?.nearby?.length > 0 &&
            renderHorizontalItemsWithRow({
              data: activeCategory.nearby,
              heading: data.heading,
              isItemFlow: false,
              rowHeading: `Near By ${showHeading(data.heading)}`,
            })}

          {activeCategory?.trending?.length > 0 &&
            renderHorizontalItemsWithRow({
              data: activeCategory.trending,
              heading: data?.heading,
              isItemFlow: false,
              rowHeading: `Trending ${showHeading(data?.heading)}`,
            })}
        </>
      )}
    </Wrapper>
  );
};
