import { API_ROUTES } from 'api/routes';
import { pickString } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';

export type SnliftHomeBanner = {
  id: number;
  title: string;
  sub_title: string;
  image: string;
  status?: number;
};

export type SnliftHomePromo = {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percent' | 'fixed' | string;
  discount_value: number;
  max_discount?: number | null;
  min_order_amount?: number;
  starts_at?: string;
  ends_at?: string;
  status?: number;
};

export type SnliftHomeHotOffer = {
  id: number;
  title: string;
  sub_title: string;
  image: string;
};

export type SnliftHomeData = {
  banners: SnliftHomeBanner[];
  promo_codes: SnliftHomePromo[];
  hot_offers: SnliftHomeHotOffer[];
};

/** Shown on Sengo home when API returns no hot offers or promos. */
export const SENGO_HOT_OFFERS_FALLBACK: SnliftHomeHotOffer[] = [
  { id: 1, title: 'Up to 25% OFF', sub_title: 'Package Discount', image: '' },
  { id: 2, title: 'Up to 25% OFF', sub_title: 'Package Discount', image: '' },
];

function formatPromoDescription(promo: SnliftHomePromo): string {
  const value = promo.discount_value;
  if (promo.discount_type === 'percent') {
    const cap =
      promo.max_discount != null ? ` (max CFA ${promo.max_discount})` : '';
    return `${value}% off${cap}.`;
  }
  return `CFA ${value} off.`;
}

function normalizeBannerItem(
  item: Record<string, unknown>,
  index: number,
): SnliftHomeBanner | null {
  const status = Number(item.status);
  if (item.status != null && status === 0) return null;

  return {
    id: Number(item.id) || index + 1,
    title: pickString(item, ['title'], 'Offer'),
    sub_title: pickString(item, ['sub_title', 'subtitle', 'description'], ''),
    image: pickString(item, ['image', 'media', 'banner'], ''),
    status: status || 1,
  };
}

function normalizeBanners(bannersRaw: unknown): SnliftHomeBanner[] {
  if (Array.isArray(bannersRaw)) {
    return bannersRaw
      .map((item, index) => normalizeBannerItem((item ?? {}) as Record<string, unknown>, index))
      .filter((banner): banner is SnliftHomeBanner => banner != null);
  }
  if (bannersRaw && typeof bannersRaw === 'object') {
    const banner = normalizeBannerItem(bannersRaw as Record<string, unknown>, 0);
    return banner ? [banner] : [];
  }
  return [];
}

export function normalizeHomeData(raw: unknown): SnliftHomeData {
  const root =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const promosRaw = Array.isArray(root.promo_codes) ? root.promo_codes : [];
  const hotOffersRaw = Array.isArray(root.hot_offers) ? root.hot_offers : [];

  const banners = normalizeBanners(root.banners);

  const promo_codes = promosRaw
    .map((item, index) => {
      const p = (item ?? {}) as Record<string, unknown>;
      const status = Number(p.status);
      if (p.status != null && status === 0) return null;

      const promo: SnliftHomePromo = {
        id: Number(p.id) || index + 1,
        code: pickString(p, ['code'], ''),
        description: pickString(p, ['description', 'desc']),
        discount_type: pickString(p, ['discount_type'], 'percent'),
        discount_value: Number(p.discount_value) || 0,
        max_discount: p.max_discount != null ? Number(p.max_discount) : null,
        min_order_amount: Number(p.min_order_amount) || 0,
        starts_at: pickString(p, ['starts_at']),
        ends_at: pickString(p, ['ends_at']),
        status: status || 1,
      };
      return promo;
    })
    .filter((promo): promo is SnliftHomePromo => promo != null);

  const hot_offers = hotOffersRaw.map((item, index) => {
    const o = (item ?? {}) as Record<string, unknown>;
    return {
      id: Number(o.id) || index + 1,
      title: pickString(o, ['title', 'offer_title', 'headline'], 'Up to 25% OFF'),
      sub_title: pickString(o, ['sub_title', 'subtitle', 'description'], 'Package Discount'),
      image: pickString(o, ['image', 'logo', 'brand_image', 'media'], ''),
    };
  });

  return { banners, promo_codes, hot_offers };
}

export function homeHotOffersForDisplay(
  hotOffers: SnliftHomeHotOffer[],
  promos: SnliftHomePromo[],
): SnliftHomeHotOffer[] {
  if (hotOffers.length > 0) return hotOffers;
  if (promos.length > 0) {
    return promos.map(p => ({
      id: p.id,
      title:
        p.discount_type === 'percent'
          ? `Up to ${Math.round(p.discount_value)}% OFF`
          : `CFA ${p.discount_value} OFF`,
      sub_title:
        p.description?.trim() ||
        formatPromoDescription(p).replace(/\.$/, '') ||
        'Package Discount',
      image: '',
    }));
  }
  return SENGO_HOT_OFFERS_FALLBACK;
}

export type HomePromoDisplay = SnliftHomePromo & { desc: string };

export function homePromosForDisplay(promos: SnliftHomePromo[]): HomePromoDisplay[] {
  return promos.map(p => ({
    ...p,
    desc: p.description?.trim() || formatPromoDescription(p),
  }));
}

// Module-level cache — persists for the app session so navigating back doesn't re-fetch.
let _homeDataCache: SnliftHomeData | null = null;
let _homeDataFetchedAt = 0;
const HOME_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export async function getHomeData(forceRefresh = false): Promise<SnliftHomeData | null> {
  const now = Date.now();
  if (!forceRefresh && _homeDataCache && now - _homeDataFetchedAt < HOME_CACHE_TTL_MS) {
    return _homeDataCache;
  }
  const raw = await handleGetApiRequest<SnliftHomeData>({
    url: API_ROUTES.HOME,
    addToPending: true,
  });
  if (!raw) return _homeDataCache;
  const data = normalizeHomeData(raw);
  _homeDataCache = data;
  _homeDataFetchedAt = now;
  return data;
}
