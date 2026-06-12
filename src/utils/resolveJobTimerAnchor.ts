export type JobTimerRouteParams = {
  timerAnchorAt?: string | null;
  startTimerOnMount?: boolean;
  createdAt?: string | null;
};

/** Lock countdown anchor — fresh bookings start on screen mount; reopen uses server created_at. */
export function resolveJobTimerAnchor(
  params?: JobTimerRouteParams | null,
): string | undefined {
  if (params?.timerAnchorAt?.trim()) return params.timerAnchorAt.trim();
  if (params?.startTimerOnMount) return new Date().toISOString();
  if (params?.createdAt?.trim()) return params.createdAt.trim();
  return undefined;
}

export function isFreshJobTimer(params?: JobTimerRouteParams | null): boolean {
  return Boolean(params?.timerAnchorAt?.trim() || params?.startTimerOnMount);
}
