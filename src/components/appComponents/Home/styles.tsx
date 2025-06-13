import { StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { screenHeight, screenWidth } from 'utils/helpers';

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
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 12,
    gap: 20,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    height: screenHeight(18),
    width: screenWidth(30),
  },
  subCategoryItemContainer: {
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
    borderRadius: 20,
    overflow: 'hidden',
    height: screenHeight(25),
    width: screenWidth(42),
  },
  itemContainer: {
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
    borderRadius: 20,
    width: screenWidth(42),
  },
  itemImage: {
    height: screenHeight(14),
    borderRadius: 20,
    width: screenWidth(40),
  },
  itemText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Black,
  },
  categoryItemText: {
    textAlign: 'center',
    color: COLORS.BORDER,
  },
  subCategoryItemText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  textOverlay: {
    position: 'absolute',
    top: screenWidth(20),
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
    height: screenHeight(24),
    borderRadius: 20,
    width: screenWidth(40),
  },
  categoryItemImageContainer: {
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
