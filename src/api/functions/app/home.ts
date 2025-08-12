import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest, handlePostApiRequest } from '.';
import {
  BUSINESS_FLOW_SLUGS,
  Category,
  CategoryListResponse,
  FavoriteResponse,
  FILTER_NAMES,
  filterTypes,
} from 'types/responseTypes';
import store from 'store/store';
import {
  setCategoriesItemList,
  setCategoriesList,
  updateItemLikedStatus,
} from 'store/slices/categories';
import { showToast } from 'utils/toast';
import { onBack } from 'navigation/index';

const getMainCategories = async () => {
  const data = await handleGetApiRequest<CategoryListResponse>({
    url: API_ROUTES.GET_CATEGORIES,
  });
  const categories = data?.categories ?? [];
  store.dispatch(setCategoriesList(categories));
  const firstCategory = categories?.[0];
  // Safe check: ensure business_flow of Event exists and slug matches with Ticket Purchase.
  if (firstCategory?.business_flow?.slug === BUSINESS_FLOW_SLUGS.TICKET_PURCHASE) {
    const { id } = firstCategory;
    getMainCategoriesHomeItems({
      id,
      page: 1,
      limit: 5,
      type: FILTER_NAMES?.UPCOMING,
      isTicketPurchase: true,
    });
    getMainCategoriesHomeItems({
      id,
      page: 1,
      limit: 5,
      type: FILTER_NAMES?.TRENDING,
      isTicketPurchase: true,
    });
  }
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
  limit = 5,
  search = '',
  type = FILTER_NAMES.TRENDING,
  isTicketPurchase = false,
}: {
  id: number;
  page: number;
  limit?: number;
  search?: string;
  type: filterTypes;
  isTicketPurchase?: boolean;
}) => {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
    [type]: 'true',
  });

  const existingItems = store
    .getState()
    .category?.categoriesList?.find(
      (cat: Category) =>
        cat?.id === id || cat?.subcategories?.some((sub: Category) => sub.id === id),
    )?.[type];

  // const existingItems = store
  //   .getState()
  //   .category?.categoriesList?.find((cat: Category) => cat?.id === id)?.[type];
  if (existingItems && existingItems?.length >= page * limit) return;

  const data = await handleGetApiRequest<any>({
    url: isTicketPurchase
      ? `${API_ROUTES.GET_CATEGORIES_ITEM}?${query?.toString()}`
      : `${API_ROUTES.GET_CATEGORIES_VENDOR}${id}?${query?.toString()}`,
  });
  if (data?.result) {
    store.dispatch(
      setCategoriesItemList({
        categoryId: id,
        items: data?.result ?? [],
        type,
      }),
    );
  }
};
const getVendorItemslist = async ({
  vendor_Id,
  page = 1,
  limit = 6,
  start_date,
  end_date,
}: {
  vendor_Id: number;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const query = new URLSearchParams({
    vendor_Id: String(vendor_Id),
    page: String(page),
    limit: String(limit),
    ...(start_date ? { start_date: String(start_date) } : {}),
    ...(end_date ? { end_date: String(end_date) } : {}),
  });

  const response = await handleGetApiRequest<any>({
    url: `${API_ROUTES.GET_VENDOR_ITEMS_BY_ID}?${query?.toString()}`,
  });

  return response;
};
const getRatinglist = async ({
  id,
  page = 1,
  limit = 5,
}: {
  id: number;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await handleGetApiRequest<any>({
    url: `${API_ROUTES.GET_RATING_BY_ITEM_ID}${id}?${query?.toString()}`,
  });

  return response;
};
const getGallerylist = async ({
  id,
  page = 1,
  limit = 6,
}: {
  id: number;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await handleGetApiRequest<any>({
    url: `${API_ROUTES.GET_GALLERY_BY_ITEM_ID}${id}/gallery?${query?.toString()}`,
  });
  return response;
};
const giveRating = async ({ data }: { data: any }) => {
  const response = await handlePostApiRequest({
    url: `${API_ROUTES.POST_RATING}`,
    data,
    showLoader: true,
  });
  if (response) {
    onBack();
    showToast({
      message: '✅ Thanks for your feedback! We appreciate your input.',
      isError: false,
    });
  }
};

export {
  getMainCategories,
  getMainCategoriesHomeItems,
  toggleFavourite,
  getRatinglist,
  giveRating,
  getGallerylist,
  getVendorItemslist,
};
