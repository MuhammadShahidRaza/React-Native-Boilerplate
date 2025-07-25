import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryItem } from 'types/responseTypes';

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
      action: PayloadAction<{ categoryId: number; items: CategoryItem[] }>,
    ) {
      const { categoryId, items } = action.payload;
      const category = state.categoriesList.find(cat => cat.id === categoryId);
      if (category) {
        category.items = [...(category.items ?? []), ...items];
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

// setCategoriesItemList(
//   state,
//   action: PayloadAction<{ categoryId: number; items: CategoryItem[] }>,
// ) {
//   const { categoryId, items } = action.payload;
//   const category = state.categoriesList.find(cat => cat.id === categoryId);

//   if (category) {
//     const existingItemIds = new Set((category.items ?? []).map(item => item.id));
//     const newItems = items.filter(item => !existingItemIds.has(item.id));

//     category.items = [...(category.items ?? []), ...newItems];
//   }
// },
// },

export const { setCategoriesList, setCategoriesItemList, updateItemLikedStatus } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;

// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { handleGetApiRequest } from 'api/functions/app';
// import { API_ROUTES } from 'api/routes';
// import { Category, CategoryListResponse } from 'types/responseTypes';

// export interface CategoriesState {
//   categoriesList: Category[];
//   data:{

//   }
// }

// const initialState: CategoriesState = {
//   categoriesList: [],
// };

// export const getMainCategories = createAsyncThunk(
//   'fetch/categoriesList',
//   async (_, { rejectWithValue }) => {
//     try {
//       const data = await handleGetApiRequest<CategoryListResponse>({
//         url: API_ROUTES.GET_CATEGORIES,
//       });

//       const result = data?.categories.filter((item)=>{

//         if(item.is_subcategory)

//         return{
//           "event" :[

//           ]
//         }
//       })

//       return data?.categories;
//     } catch (error) {
//       return rejectWithValue('Failed to fetch dashboard data');
//     }

//     // store.dispatch(setCategoriesList(data?.categories ?? []));
//     // try {
//     //   const response = await get({ url: endpoints.Home });
//     //   if (!response?.data) {
//     //     return rejectWithValue("No data found");
//     //   }
//     //   return response?.data;
//     // } catch (error) {
//     //   ErrorHandler(error);
//     //   return rejectWithValue("Failed to fetch dashboard data");
//     // }
//   },
// );

// const categoriesSlice = createSlice({
//   name: 'category',
//   initialState,
//   reducers: {
//     setCategoriesList(state, action: PayloadAction<Category[]>) {
//       state.categoriesList = action.payload;
//     },
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(getMainCategories.pending, state => {
//         // setLoadingStates(state, {
//         //   general: true,
//         //   organizations: true,
//         //   upcomingMeetings: true,
//         // });
//         // state.error = null;
//       })
//       .addCase(getMainCategories.fulfilled, (state, action) => {
//         if (action.payload) state.categoriesList = action?.payload;
//         // setLoadingStates(state, {
//         //   general: false,
//         //   organizations: false,
//         //   upcomingMeetings: false,
//         // });
//         // state.data = { ...state.data, ...action.payload };
//         // state.notFound = false;
//         // state.error = null;
//       })
//       .addCase(getMainCategories.rejected, (state, action) => {
//         // handleError(state, action.payload as string, {
//         //   general: false,
//         //   organizations: false,
//         //   upcomingMeetings: false,
//         // });
//         // state.notFound = true;
//       });
//   },
// });

// export const { setCategoriesList } = categoriesSlice.actions;
// export default categoriesSlice.reducer;
