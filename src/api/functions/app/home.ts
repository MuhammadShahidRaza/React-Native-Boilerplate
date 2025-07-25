import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest, handlePostApiRequest } from '.';
import { Category, CategoryListResponse, FavoriteResponse } from 'types/responseTypes';
import store from 'store/store';
import {
  setCategoriesItemList,
  setCategoriesList,
  updateItemLikedStatus,
} from 'store/slices/categories';

const getMainCategories = async () => {
  const data = await handleGetApiRequest<CategoryListResponse>({
    url: API_ROUTES.GET_CATEGORIES,
  });
  store.dispatch(setCategoriesList(data?.categories ?? []));
  getMainCategoriesHomeItems({ id: 1, page: 1, limit: 5 });
};

const toggleFavourite = async ({
  object_id,
  object_type,
  category_id,
}: {
  object_id: number;
  category_id: number;
  object_type: 'vendor' | 'item';
}) => {
  const response: FavoriteResponse | undefined = await handlePostApiRequest({
    url: API_ROUTES.TOGGLE_FAVOURITE,
    data: { object_id, object_type },
  });
  if (response?.favourite && object_type === 'item') {
    store.dispatch(
      updateItemLikedStatus({
        categoryId: category_id,
        itemId: object_id,
        i_liked: response.favourite.is_liked,
      }),
    );
  }
};

const getMainCategoriesHomeItems = async ({
  id,
  page = 1,
  limit = 10,
  search = '',
}: {
  id: number;
  page: number;
  limit: number;
  search?: string;
}) => {
  const existingItems = store
    .getState()
    .category?.categoriesList?.find((cat: Category) => cat?.id === id)?.items;
  if (existingItems && existingItems?.length <= limit) {
    return;
  }
  const data = await handleGetApiRequest<any>({
    url: `${API_ROUTES.GET_CATEGORIES_ITEM}search=${search}&page=${page}&limit=${limit}`,
  });
  store.dispatch(
    setCategoriesItemList({
      categoryId: id,
      items: data?.result ?? [],
    }),
  );
};

export { getMainCategories, getMainCategoriesHomeItems, toggleFavourite };
