/**
 * Puppeteer configuration file.
 *
 * Sets the browser cache directory to a project-relative path so that:
 * - `npx puppeteer browsers install chrome` during the Render build step
 *   places Chrome in the same location that Puppeteer looks at runtime.
 * - The path is stable regardless of what $PWD resolves to when npm scripts
 *   are executed (avoids the $PWD-expansion issue on Windows/cloud).
 */
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
};
