import { StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS, isIOS, STYLES } from 'utils/index';
import { screenHeight, screenWidth } from 'utils/index';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  searchBar: {
    marginHorizontal: 20,
  },
  categoriesFlatList: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  categoriesContentContainer: {
    paddingRight: 20,
  },
  subCategoriesContentContainer: {
    gap: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  subCategoriesColumnWrapper: {
    gap: 20,
  },
  categoryItemContainer: {
    padding: 10,
    gap: 10,
    marginRight: 10,
    marginBottom: 5,
    borderRadius: 20,
    alignItems: 'center',
    height: screenHeight(15),
    width: screenWidth(28),
    ...STYLES.SHADOW,
  },
  subCategoryItemContainer: {
    padding: 5,
    borderRadius: 20,
    overflow: 'hidden',
    height: screenHeight(22),
    width: screenWidth(42),
    ...STYLES.SHADOW,
  },
  itemContainer: {
    ...STYLES.SHADOW,
    padding: 5,
    borderRadius: 20,
    width: screenWidth(42),
  },
  itemImage: {
    height: screenHeight(14),
    borderRadius: 15,
    width: screenWidth(40),
  },
  itemText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Black,
  },
  categoryItemText: {
    textAlign: 'center',
    color: COLORS.BORDER,
    fontSize: FontSize.MediumSmall,
  },
  subCategoryItemText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
  textOverlay: {
    position: 'absolute',
    top: screenHeight(8),
    left: 12,
    right: 12,
    borderWidth: 1.5,
    borderColor: COLORS.WHITE,
    backgroundColor: COLORS.DARK_BLACK_OPACITY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  categoryItemImage: {
    height: screenHeight(5),
    width: screenWidth(15),
  },
  subCategoryItemImage: {
    height: screenHeight(21),
    borderRadius: 20,
    width: screenWidth(40),
  },
  categoryItemImageContainer: {
    padding: 15,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  heartIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 100,
    backgroundColor: COLORS.WHITE_OPACITY,
    padding: 8,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: COLORS.SECONDARY,
  },
  ratingContainer: {
    top: 8,
    left: 5,
    position: 'absolute',
    backgroundColor: COLORS.DARK_BLACK_OPACITY,
    zIndex: 100,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.SECONDARY,
  },
});
