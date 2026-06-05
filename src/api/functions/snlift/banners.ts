import { API_ROUTES } from 'api/routes';
import { extractApiList } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';

export type SnliftBanner = {
  id: number;
  title?: string;
  sub_title?: string;
  image?: string | null;
  status?: number;
};

export async function listBanners() {
  const raw = await handleGetApiRequest<SnliftBanner[] | { banners: SnliftBanner[] }>({
    url: API_ROUTES.BANNERS,
    showError: false,
  });
  if (!raw) return [];
  return extractApiList<SnliftBanner>(raw, ['banners', 'data', 'items']);
}

export async function getBannerById(id: number | string) {
  return handleGetApiRequest<{ banner: SnliftBanner } | SnliftBanner>({
    url: API_ROUTES.BANNER_BY_ID(id),
    showError: false,
  });
}
