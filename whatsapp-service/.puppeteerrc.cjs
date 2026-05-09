/**
 * Puppeteer configuration file.
 *
 * Sets the browser cache directory to a project-relative path so that:
 * - `npx puppeteer browsers install chrome` during the Render build step
 *   places Chrome in the same location that Puppeteer looks at runtime.
 * - `puppeteer.executablePath()` in config/index.js resolves the same path
 *   and passes it to whatsapp-web.js (puppeteer-core) at runtime.
 * - The path is stable regardless of what $PWD resolves to when npm scripts
 *   are executed (avoids the $PWD-expansion issue on Windows/cloud).
 *
 * NOTE: skipDownload is intentionally NOT set here. The .npmrc file sets
 * puppeteer_skip_download=true which prevents the postinstall hook from
 * downloading Chrome (avoids stale-directory issues). The explicit build
 * step uses PUPPETEER_SKIP_DOWNLOAD=false to override .npmrc and perform
 * the actual download. The PUPPETEER_SKIP_DOWNLOAD env var has higher
 * priority than the npm_config_* env var from .npmrc, so the override works.
 */
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
};
