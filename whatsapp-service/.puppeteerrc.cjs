/**
 * Puppeteer configuration file.
 *
 * Sets the browser cache directory to a project-relative path so that:
 * - `npx puppeteer browsers install chrome` during the Render build step
 *   places Chrome in the same location that Puppeteer looks at runtime.
 * - The path is stable regardless of what $PWD resolves to when npm scripts
 *   are executed (avoids the $PWD-expansion issue on Windows/cloud).
 *
 * skipDownload: true prevents Puppeteer's npm postinstall hook from trying
 * (and silently failing) to download Chrome during `npm install`. The explicit
 * `npm run build` step owns the download instead, avoiding the "browser folder
 * exists but executable is missing" error on Render caused by a partial/failed
 * postinstall download leaving a stale directory behind.
 */
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
  skipDownload: true,
};
