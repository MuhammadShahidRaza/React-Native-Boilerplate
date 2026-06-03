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
  discount_type: 'percent' | 'fixed' | string;
  discount_value: number;
  max_discount?: number | null;
  min_order_amount?: number;
  starts_at?: string;
  ends_at?: string;
};

export type SnliftHomeData = {
  banners: SnliftHomeBanner[];
  promo_codes: SnliftHomePromo[];
};

function formatPromoDescription(promo: SnliftHomePromo): string {
  const value = promo.discount_value;
  if (promo.discount_type === 'percent') {
    const cap =
      promo.max_discount != null ? ` (max CFA ${promo.max_discount})` : '';
    return `${value}% off${cap}.`;
  }
  return `CFA ${value} off.`;
}

export function normalizeHomeData(raw: unknown): SnliftHomeData {
  const root =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const bannersRaw = Array.isArray(root.banners) ? root.banners : [];
  const promosRaw = Array.isArray(root.promo_codes) ? root.promo_codes : [];

  const banners = bannersRaw.map((item, index) => {
    const b = (item ?? {}) as Record<string, unknown>;
    return {
      id: Number(b.id) || index + 1,
      title: pickString(b, ['title'], 'Offer'),
      sub_title: pickString(b, ['sub_title', 'subtitle', 'description'], ''),
      image: pickString(b, ['image', 'media', 'banner'], ''),
      status: Number(b.status) || 1,
    };
  });

  const promo_codes = promosRaw.map((item, index) => {
    const p = (item ?? {}) as Record<string, unknown>;
    const promo: SnliftHomePromo = {
      id: Number(p.id) || index + 1,
      code: pickString(p, ['code'], ''),
      discount_type: pickString(p, ['discount_type'], 'percent'),
      discount_value: Number(p.discount_value) || 0,
      max_discount: p.max_discount != null ? Number(p.max_discount) : null,
      min_order_amount: Number(p.min_order_amount) || 0,
      starts_at: pickString(p, ['starts_at']),
      ends_at: pickString(p, ['ends_at']),
    };
    return promo;
  });

  return { banners, promo_codes };
}

export type HomePromoDisplay = SnliftHomePromo & { desc: string };

export function homePromosForDisplay(promos: SnliftHomePromo[]): HomePromoDisplay[] {
  return promos.map(p => ({ ...p, desc: formatPromoDescription(p) }));
}

export async function getHomeData(): Promise<SnliftHomeData | null> {
  const raw = await handleGetApiRequest<SnliftHomeData>({
    url: API_ROUTES.HOME,
    addToPending: true,
  });
  if (!raw) return null;
  return normalizeHomeData(raw);
}
