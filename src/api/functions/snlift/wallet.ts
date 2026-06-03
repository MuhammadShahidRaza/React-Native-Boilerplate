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

export function mapTransactionsToUi(
  res: SnliftWalletTransaction[] | { transactions: SnliftWalletTransaction[] } | undefined,
): WalletTransactionUi[] {
  return extractTransactions(res).map(t =>
    normalizeWalletTransaction(t as SnliftWalletTransaction & Record<string, unknown>),
  );
}
