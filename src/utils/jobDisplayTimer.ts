const DEFAULT_JOB_DISPLAY_TIMER = '00:02:00';

/** Parse admin timer string (HH:MM:SS, MM:SS, or plain minutes) into total seconds. */
export function parseJobDisplayTimer(value: string | number | null | undefined): number {
  if (value == null || value === '') {
    return parseJobDisplayTimer(DEFAULT_JOB_DISPLAY_TIMER);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Backend may send bare minutes (e.g. 2) or seconds (e.g. 120).
    return value >= 60 ? Math.round(value) : Math.round(value * 60);
  }

  const raw = String(value).trim();
  if (!raw.includes(':') && /^\d+(\.\d+)?$/.test(raw)) {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return 120;
    return n >= 60 ? Math.round(n) : Math.round(n * 60);
  }

  const parts = raw.split(':').map(p => parseInt(p, 10));
  if (parts.some(n => Number.isNaN(n))) return 120;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  const only = parts[0] ?? 2;
  return only >= 60 ? only : only * 60;
}

export function parseBookingCreatedAtMs(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  let normalized = raw;
  if (raw.includes('T')) {
    normalized = raw.replace(/\.(\d{3})\d*/, '.$1');
    if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}Z`;
    }
  } else {
    normalized = `${raw.replace(' ', 'T')}Z`;
  }
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Use server booking created_at unless it is clearly skewed vs the client clock.
 * Fixes cases where server time is ~minutes behind and timer opens with 30s left instead of 2min.
 */
export function resolveTimerCreatedAt(
  serverCreatedAt: string | null | undefined,
  clientStartedAt: string = new Date().toISOString(),
  maxSkewMs = 10_000,
): string {
  const serverMs = parseBookingCreatedAtMs(serverCreatedAt);
  const now = Date.now();

  if (serverMs == null) return clientStartedAt;

  const elapsedSinceServer = now - serverMs;
  const serverAhead = serverMs - now;

  if (elapsedSinceServer > maxSkewMs || serverAhead > 5_000) {
    return clientStartedAt;
  }

  return serverCreatedAt!.trim();
}

export function getJobExpiresAt(createdAt: string, durationSeconds: number): number {
  const createdMs = parseBookingCreatedAtMs(createdAt) ?? Date.now();
  return createdMs + durationSeconds * 1000;
}

export function getRemainingJobTimerSeconds(
  createdAt: string,
  durationSeconds: number,
  nowMs: number = Date.now(),
): number {
  const expiresAt = getJobExpiresAt(createdAt, durationSeconds);
  return Math.max(0, Math.ceil((expiresAt - nowMs) / 1000));
}

export function formatJobTimerLabel(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins <= 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}
