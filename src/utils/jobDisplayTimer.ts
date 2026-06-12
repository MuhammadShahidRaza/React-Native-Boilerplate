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
    const [first, second] = parts;
    // HH:MM (e.g. 00:02 = 2 minutes) vs MM:SS (e.g. 01:30 = 90 seconds).
    if (first === 0 || first > 59) {
      return first * 3600 + second * 60;
    }
    return first * 60 + second;
  }
  const only = parts[0] ?? 2;
  return only >= 60 ? only : only * 60;
}

export function parseBookingCreatedAtMs(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  let normalized = raw;
  if (raw.includes('T')) {
    normalized = raw.replace(/\.(\d{3})\d+/, '.$1');
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
      normalized = `${normalized}Z`;
    }
  } else {
    normalized = `${raw.replace(' ', 'T')}Z`;
  }
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** Always prefer server booking created_at for countdown (remaining = duration - (now - created_at)). */
export function resolveBookingTimerCreatedAt(
  serverCreatedAt: string | null | undefined,
  fallback?: string,
): string {
  if (serverCreatedAt?.trim()) return serverCreatedAt.trim();
  return fallback ?? new Date().toISOString();
}

/**
 * Fresh booking: client anchor (full admin timer).
 * Reopen from activity: server created_at (elapsed time applies).
 */
export function resolveTimerAnchorAt(
  timerAnchorAt?: string | null,
  serverCreatedAt?: string | null,
): string {
  if (timerAnchorAt?.trim()) return timerAnchorAt.trim();
  return resolveBookingTimerCreatedAt(serverCreatedAt);
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
  return Math.max(0, Math.floor((expiresAt - nowMs) / 1000));
}

export function formatJobTimerParts(totalSeconds: number): {
  minutes: string;
  seconds: string;
  label: string;
} {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return {
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    label: mins > 0 && secs > 0 ? 'Min Sec' : mins > 0 ? 'Min' : 'Sec',
  };
}

export function formatJobTimerLabel(totalSeconds: number): string {
  const { minutes, seconds } = formatJobTimerParts(totalSeconds);
  const mins = parseInt(minutes, 10);
  const secs = parseInt(seconds, 10);
  if (mins <= 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}
