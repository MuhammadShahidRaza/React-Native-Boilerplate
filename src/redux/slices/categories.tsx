import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryItem, filterTypes } from 'types/responseTypes';

export interface CategoriesState {
  categoriesList: Category[];
  categoriesItemList: CategoryItem[];
}

const initialState: CategoriesState = {
  categoriesList: [],
  categoriesItemList: [],
};

const categoriesSlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategoriesList(state, action: PayloadAction<Category[]>) {
      state.categoriesList = action.payload;
    },

    setCategoriesItemList(
      state,
      action: PayloadAction<{
        categoryId: number;
        items: CategoryItem[];
        type: filterTypes;
      }>,
    ) {
      const { categoryId, items, type } = action.payload;
      const category =
        state.categoriesList.find(cat => cat.id === categoryId) ||
        state.categoriesList
          .flatMap(cat => cat.subcategories || [])
          .find(sub => sub.id === categoryId);

          console.log("category");
          console.log(category);
          console.log(type);
          console.log(items);
          console.log('category');
          
      if (category) {
        if (!category[type]) category[type] = []; // Make sure the type exists (trending/upcoming)
        category[type] = [...(category[type] ?? []), ...items];
      }
    },

    updateItemLikedStatus(
      state,
      action: PayloadAction<{ categoryId: number; itemId: number; i_liked: boolean }>,
    ) {
      const { categoryId, itemId, i_liked } = action.payload;

      const category = state.categoriesList.find(cat => cat.id === categoryId);
      if (!category || !category.items) return;

      const item = category.items.find(item => item.id === itemId);
      if (item) {
        item.is_liked = i_liked;
      }
    },
  },
});

export const { setCategoriesList, setCategoriesItemList, updateItemLikedStatus } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;

// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Category, CategoryItem, filterTypes } from 'types/responseTypes';

// export interface CategoriesState {
//   categoriesList: Category[];
//   categoriesItems: {
//     [categoryId: number]: {
//       [filterType in filterTypes]?: CategoryItem[];
//     };
//   };
// }

// const initialState: CategoriesState = {
//   categoriesList: [],
//   categoriesItems: [],
// };

// const categoriesSlice = createSlice({
//   name: 'category',
//   initialState,
//   reducers: {
//     setCategoriesList(state, action: PayloadAction<Category[]>) {
//       state.categoriesList = action.payload;
//     },

//     setCategoriesItemList(
//       state,
//       action: PayloadAction<{
//         categoryId: number;
//         items: CategoryItem[];
//         type: filterTypes;
//       }>,
//     ) {
//       const { categoryId, items, type } = action.payload;

//       if (!state.categoriesItems[categoryId]) {
//         state.categoriesItems[categoryId] = {};
//       }

//       if (!state.categoriesItems[categoryId][type]) {
//         state.categoriesItems[categoryId][type] = [];
//       }
//       console.log(categoryId);
//       console.log(type);

//       console.log(state.categoriesItems[categoryId][type]);
//       console.log(items);

//       state.categoriesItems[categoryId][type] = [
//         ...state.categoriesItems[categoryId][type]!,
//         ...items,
//       ];

//       // const category = state.categoriesList.find(cat => cat.id === categoryId);
//       // // if (category) {
//       // //   category.items = [...(category.items ?? []), ...items];
//       // // }

//       // if (category) {
//       //   if (!category[type]) category[type] = []; // Make sure the type exists (trending/upcoming)
//       //   category[type] = [...(category[type] ?? []), ...items];
//       // }
//     },

//     updateItemLikedStatus(
//       state,
//       action: PayloadAction<{ categoryId: number; itemId: number; i_liked: boolean }>,
//     ) {
//       const { categoryId, itemId, i_liked } = action.payload;

//       const category = state.categoriesList.find(cat => cat.id === categoryId);
//       if (!category || !category.items) return;

//       const item = category.items.find(item => item.id === itemId);
//       if (item) {
//         item.is_liked = i_liked;
//       }
//     },
//   },
// });

// // setCategoriesItemList(
// //   state,
// //   action: PayloadAction<{ categoryId: number; items: CategoryItem[] }>,
// // ) {
// //   const { categoryId, items } = action.payload;
// //   const category = state.categoriesList.find(cat => cat.id === categoryId);

// //   if (category) {
// //     const existingItemIds = new Set((category.items ?? []).map(item => item.id));
// //     const newItems = items.filter(item => !existingItemIds.has(item.id));

// //     category.items = [...(category.items ?? []), ...newItems];
// //   }
// // },
// // },

// export const { setCategoriesList, setCategoriesItemList, updateItemLikedStatus } =
//   categoriesSlice.actions;
// export default categoriesSlice.reducer;
