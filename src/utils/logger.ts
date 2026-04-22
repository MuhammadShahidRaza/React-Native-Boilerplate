/**
 * Logger utility. In production, log/warn/debug are no-ops.
 * Use for development debugging; errors always log for crash reporting.
 */
const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
  /** Always logs - use for errors that need crash reporting */
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};
