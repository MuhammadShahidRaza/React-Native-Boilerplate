import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  FlatListComponent,
  Typography,
  SearchBar,
  SvgComponent,
  Photo,
  RowComponent,
  Icon,
  SkeletonLoader,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { isIOS, screenHeight, screenWidth } from 'utils/index';
import { categoriesList, CategoryType, subCategoriesList } from '.';
import { styles } from './styles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/index';

export const HomeComponent = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const handlePress = (id: string) => {
    setSelectedCategory(id);
  };
  const handleSubCategoryPress = (key: string) => {
    // navigate(SCREENS.SUB_CATEGORY, { id });
  };

  const getSelectedCategoryData = () => {
    const mainCategory = categoriesList.find(cat => cat.id === selectedCategory);
    if (!mainCategory) return null;

    return subCategoriesList.find(cat => cat.key === mainCategory.name);
  };

  const renderCategoryItem = ({ item }: { item: CategoryType }) => (
    <TouchableOpacity
      key={item?.id}
      style={styles.categoryItemContainer}
      onPress={() => handlePress(item.id)}
    >
      <SvgComponent
        containerStyle={[
          styles.categoryItemImageContainer,
          { backgroundColor: selectedCategory === item?.id ? COLORS.PRIMARY : COLORS.WHITE },
        ]}
        Svg={item?.image}
        svgHeight={screenHeight(5)}
        svgWidth={screenWidth(isIOS() ? 13 : 15)}
        fill={selectedCategory === item?.id ? COLORS.WHITE : COLORS.BORDER}
      />

      <Typography
        numberOfLines={1}
        style={[
          styles.categoryItemText,
          { color: selectedCategory === item?.id ? COLORS.PRIMARY : COLORS.BORDER },
        ]}
      >
        {item?.name}
      </Typography>
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }: { item: { key: string; image: string } }) => (
    <SkeletonLoader key={item?.key}>
      <TouchableOpacity
        style={styles.subCategoryItemContainer}
        onPress={() => handleSubCategoryPress(item?.key)}
      >
        <Photo disabled imageStyle={styles.subCategoryItemImage} source={item?.image} />
        <View style={styles.textOverlay}>
          <Typography numberOfLines={1} style={styles.subCategoryItemText}>
            {item?.key}
          </Typography>
        </View>
      </TouchableOpacity>
    </SkeletonLoader>
  );

  const renderItems = ({
    item,
  }: {
    item: {
      id: string;
      name: string;
      image: string;
      city: string;
      country: string;
      distance?: string;
      isOpen?: boolean;
      openTime?: string;
    };
  }) => (
    <SkeletonLoader key={item?.name} height={screenHeight(25)}>
      <View style={styles.itemContainer}>
        <Photo disabled imageStyle={styles.itemImage} source={item?.image} />
        <View style={{ paddingHorizontal: 10, paddingTop: 5, gap: isIOS() ? 4 : 2 }}>
          <Typography numberOfLines={1} style={styles.itemText}>
            {item?.name}
          </Typography>
          <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 5 }}>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
            >
              {item?.city + ' - '}
            </Typography>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
            >
              {item?.country}
            </Typography>
          </RowComponent>
          {item?.openTime && (
            <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
              <Typography
                numberOfLines={1}
                style={{
                  color: COLORS.SECONDARY,
                  fontSize: FontSize.Small,
                  fontWeight: FontWeight.SemiBold,
                }}
              >
                {item?.isOpen ? 'OPEN' : 'CLOSED'}
              </Typography>
              <Typography
                numberOfLines={1}
                style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
              >
                {item?.openTime}
              </Typography>
            </RowComponent>
          )}
          {item?.distance && (
            <RowComponent
              style={{
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: 5,
                paddingHorizontal: -20,
                marginLeft: -3,
              }}
            >
              <Icon
                componentName={VARIABLES.EvilIcons}
                iconName={'location'}
                size={FontSize.MediumLarge}
                iconStyle={{ color: COLORS.DARK_GREY }}
              />
              <Typography
                numberOfLines={1}
                style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
              >
                {item?.distance}
              </Typography>
            </RowComponent>
          )}
        </View>
        <Typography
          onPress={() => navigate(SCREENS.VIEW_ALL, { data: item })}
          numberOfLines={1}
          style={{
            color: COLORS.SECONDARY,
            fontWeight: FontWeight.SemiBold,
            textAlign: 'center',
            fontSize: FontSize.Small,
            marginTop: 5,
          }}
        >
          See Details
        </Typography>
      </View>
    </SkeletonLoader>
  );

  const renderCategoryContent = () => {
    const selectedData = getSelectedCategoryData();
    if (!selectedData) return null;

    const hasSubCategories = (selectedData.subCategories?.length ?? 0) > 0;
    const hasItems = (selectedData.items?.length ?? 0) > 0;

    return (
      <>
        {hasSubCategories && (
          <FlatListComponent
            numColumns={2}
            scrollEnabled={true}
            columnWrapperStyle={styles.subCategoriesColumnWrapper}
            contentContainerStyle={styles.subCategoriesContentContainer}
            data={selectedData.subCategories ?? []}
            renderItem={renderSubCategoryItem}
          />
        )}
        {hasItems && (
          <FlatListComponent
            numColumns={2}
            scrollEnabled={true}
            style={{ height: screenHeight(isIOS() ? 52 : 59) }}
            columnWrapperStyle={styles.subCategoriesColumnWrapper}
            contentContainerStyle={styles.subCategoriesContentContainer}
            data={selectedData.items?.slice(0, 2) ?? []}
            renderItem={renderItems}
          />
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        showBorder={false}
        containerStyle={styles.searchBar}
      />
      <FlatListComponent
        horizontal={true}
        style={styles.categoriesFlatList}
        contentContainerStyle={styles.categoriesContentContainer}
        data={categoriesList}
        renderItem={renderCategoryItem}
      />
      {selectedCategory && renderCategoryContent()}
    </View>
  );
};
