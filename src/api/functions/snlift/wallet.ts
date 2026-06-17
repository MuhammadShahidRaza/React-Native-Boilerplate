import { API_ROUTES } from 'api/routes';
import {
  extractApiList,
  normalizeWalletSummary,
  normalizeWalletTransaction,
  parseBalanceValue,
  type WalletTransactionUi,
} from 'api/normalizers/snlift';
import { handleGetApiRequest, handlePostApiRequest } from '../app';
import { APP_CONFIG } from 'config/app';
import { ENV_CONSTANTS } from 'constants/common';
import { ALPHA_WORKER_WALLET_SUMMARY } from 'components/common/worker/workerMockData';
import type { SnliftWalletSummary, SnliftWalletTransaction } from 'types/snliftApi';

function walletRoutesForRole(role: string | null | undefined) {
  if (role === APP_CONFIG.COURIER_ROLE) {
    return {
      summary: API_ROUTES.COURIER_WALLET_SUMMARY,
      transactions: API_ROUTES.COURIER_WALLET_TRANSACTIONS,
    };
  }
  return {
    summary: API_ROUTES.DRIVER_WALLET_SUMMARY,
    transactions: API_ROUTES.DRIVER_WALLET_TRANSACTIONS,
  };
}

export async function getWorkerWalletSummary(role: string | null | undefined) {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return normalizeWalletSummary(ALPHA_WORKER_WALLET_SUMMARY);
  }

  const routes = walletRoutesForRole(role);
  const raw = await handleGetApiRequest<SnliftWalletSummary>({
    url: routes.summary,
    showError: false,
  });
  if (!raw) return null;
  return normalizeWalletSummary(raw);
}

export async function getUserWalletSummary() {
  const raw = await handleGetApiRequest<object>({
    url: API_ROUTES.USER_WALLET_SUMMARY,
    showError: false,
  });
  if (!raw) return null;
  return normalizeWalletSummary(raw);
}

export async function getWorkerWalletTransactions(role: string | null | undefined) {
  const routes = walletRoutesForRole(role);
  return handleGetApiRequest<
    SnliftWalletTransaction[] | { transactions: SnliftWalletTransaction[] }
  >({
    url: routes.transactions,
    showError: false,
  });
}

export function extractTransactions(
  res: SnliftWalletTransaction[] | { transactions: SnliftWalletTransaction[] } | undefined,
): SnliftWalletTransaction[] {
  return extractApiList<SnliftWalletTransaction>(res, [
    'transactions',
    'data',
    'wallet_transactions',
    'items',
  ]);
}

/** GET /wallet — compatibility summary (same shape as user/wallet-summary). */
export async function getCompatWalletSummary() {
  const raw = await handleGetApiRequest<object>({
    url: API_ROUTES.GET_WALLET,
    showError: false,
  });
  if (!raw) return null;
  return normalizeWalletSummary(raw);
}

export async function createStripeConnectLink() {
  return handlePostApiRequest<{ onboarding_url?: string; url?: string }, Record<string, never>>({
    url: API_ROUTES.WALLET_STRIPE_CONNECT,
    data: {},
    showError: false,
  });
}

export function parseWalletSummaryBalance(summary: SnliftWalletSummary | null): number | null {
  if (!summary) return null;
  return (
    parseBalanceValue(summary.wallet_balance) ??
    parseBalanceValue(summary.balance) ??
    parseBalanceValue(summary.total_cfa_balance)
  );
}

type WalletServiceCounts = {
  ride?: number;
  parcel?: number;
  food?: number;
  total?: number;
};

/** Completed job count from wallet `service_summary.counts` (avoids extra bookings list on home). */
export function getWorkerJobCountFromWalletSummary(
  summary: SnliftWalletSummary | null | undefined,
  role: string | null | undefined,
): number {
  const counts = (summary as { service_summary?: { counts?: WalletServiceCounts } } | null)
    ?.service_summary?.counts;
  if (!counts) return 0;

  if (role === APP_CONFIG.COURIER_ROLE) {
    return counts.parcel ?? counts.food ?? counts.total ?? 0;
  }

  return counts.ride ?? counts.total ?? 0;
}

export function mapTransactionsToUi(
  res: SnliftWalletTransaction[] | { transactions: SnliftWalletTransaction[] } | undefined,
): WalletTransactionUi[] {
  return extractTransactions(res).map(t =>
    normalizeWalletTransaction(t as SnliftWalletTransaction & Record<string, unknown>),
  );
}
