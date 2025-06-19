import { useState, useEffect, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import {
  FlatListComponent,
  Typography,
  SearchBar,
  SvgComponent,
  Photo,
  SkeletonLoader,
  renderHorizontalItemsWithRow,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { isIOS, screenHeight, screenWidth } from 'utils/index';
import { categoriesList, CategoryType, subCategoriesList } from '.';
import { styles } from './styles';
import { SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';

export const HomeComponent = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const [itemHeading, setItemHeading] = useState<string>('');

  // Memoize the selected category data to prevent unnecessary recalculations
  const selectedData = useMemo(() => {
    const mainCategory = categoriesList.find(cat => cat.id === selectedCategory);
    if (!mainCategory) return null;
    return subCategoriesList.find(cat => cat.key === mainCategory.name);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedData) return;
    const mainCategory = categoriesList.find(cat => cat.id === selectedCategory);
    if (!mainCategory) return;
    setItemHeading(mainCategory.name);
  }, [selectedCategory, selectedData]);

  const handlePress = (id: string) => {
    setSelectedCategory(id);
  };

  const handleSubCategoryPress = (key: string) => {
    navigate(SCREENS.SUB_CATEGORY_ITEMS, {
      data: {
        heading: key,
        items: selectedData?.items ?? [],
        itemHeading: key,
      },
    });
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

  const renderCategoryContent = () => {
    if (!selectedData) return null;

    const hasSubCategories = (selectedData.subCategories?.length ?? 0) > 0;
    const hasItems = (selectedData.items?.length ?? 0) > 0;

    return (
      <ScrollView style={{ height: screenHeight(isIOS() ? 47 : 52) }}>
        {hasSubCategories && (
          <FlatListComponent
            keyExtractor={item => item?.key}
            numColumns={2}
            columnWrapperStyle={styles.subCategoriesColumnWrapper}
            contentContainerStyle={styles.subCategoriesContentContainer}
            data={selectedData.subCategories ?? []}
            renderItem={renderSubCategoryItem}
          />
        )}

        {!hasSubCategories && hasItems && (
          <>
            {renderHorizontalItemsWithRow({
              data: selectedData.items ?? [],
              heading: itemHeading,
              rowHeading: `Upcoming ${itemHeading}`,
            })}
            {renderHorizontalItemsWithRow({
              data: selectedData.items ?? [],
              heading: itemHeading,
              rowHeading: `Trending ${itemHeading}`,
            })}
          </>
        )}
      </ScrollView>
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
