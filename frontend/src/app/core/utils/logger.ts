import { environment } from '../../../environments/environment';

export const logger = {
  log: (...args: unknown[]) => {
    if (!environment.production) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (!environment.production) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (!environment.production) console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (!environment.production) console.debug(...args);
  },
};
