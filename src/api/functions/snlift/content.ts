import { API_ROUTES } from 'api/routes';
import {
  extractApiList,
  normalizeContentPage,
  type SnliftContentPageNormalized,
} from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';

export type SnliftContentPage = SnliftContentPageNormalized;

export async function getAllContent(): Promise<SnliftContentPage[] | null> {
  const raw = await handleGetApiRequest<object>({ url: API_ROUTES.CONTENT_ALL });
  if (!raw) return null;
  const list = extractApiList<Record<string, unknown>>(raw, ['data', 'content', 'pages']);
  const items = list.length > 0 ? list : Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  return items.map(item => normalizeContentPage(item ?? {}));
}

export async function getContentBySlug(slug: string): Promise<SnliftContentPage | null> {
  const raw = await handleGetApiRequest<Record<string, unknown>>({
    url: API_ROUTES.CONTENT_BY_SLUG(slug),
  });
  if (!raw) return null;
  const page =
    raw && typeof raw === 'object' && 'content' in raw
      ? ((raw.content ?? raw.page ?? raw) as Record<string, unknown>)
      : raw;
  return normalizeContentPage(page ?? {});
}
