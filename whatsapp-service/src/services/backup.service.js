const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");
const config = require("../config");

// ── Structured logger ─────────────────────────────────────────────────────────
function log(level, event, meta = {}) {
  console.log(
    JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...meta })
  );
}

// ── Session content filters ───────────────────────────────────────────────────
const ESSENTIAL_DIRS = new Set([
  "IndexedDB",
  "Local Storage",
  "Session Storage",
  "Service Worker",
  "shared_proto_db",
]);
const ESSENTIAL_FILES = new Set([
  "Preferences",
  "Cookies",
  "Cookies-journal",
  "Login Data",
  "Login Data-journal",
  "Network Persistent State",
  "TransportSecurity",
]);

const SKIP_DIRS = new Set([
  "GPUCache",
  "DawnCache",
  "GrShaderCache",
  "ShaderCache",
  "blob_storage",
  "Code Cache",
  "optimization_guide",
  "Platform Notifications",
  "webrtc_event_logs",
  "Default\\GPUCache",
  "Default\\DawnCache",
  "Default\\GrShaderCache",
  "Default\\ShaderCache",
  "Default\\blob_storage",
  "Default\\Code Cache",
]);

function shouldSkip(entryPath) {
  const normalized = entryPath.replace(/\\/g, "/");
  for (const skip of SKIP_DIRS) {
    if (normalized.includes(skip.replace(/\\/g, "/"))) return true;
  }
  return false;
}

function isEssentialPath(entryName, prefix) {
  if (ESSENTIAL_DIRS.has(entryName) || ESSENTIAL_FILES.has(entryName)) return true;
  if (!prefix || prefix === "Default") {
    return entryName === "Default";
  }
  return true;
}

// ── Zip helpers ───────────────────────────────────────────────────────────────
async function zipSessionEssentials(sessionDir) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const archive = archiver("zip", { zlib: { level: 6 }, store: false });
    archive.on("data", (chunk) => buffers.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(buffers)));
    archive.on("error", reject);
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        log("warn", "archive_warning", { message: err.message });
      } else {
        reject(err);
      }
    });

    const addEssentials = (dir, prefix) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch { return; }
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const archivePath = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (shouldSkip(archivePath)) continue;

        if (entry.isDirectory()) {
          if (isEssentialPath(entry.name, prefix)) {
            addEssentials(fullPath, archivePath);
          }
        } else {
          if (!prefix || prefix === "Default") {
            if (isEssentialPath(entry.name, prefix)) {
              archive.file(fullPath, { name: archivePath });
            }
          } else {
            archive.file(fullPath, { name: archivePath });
          }
        }
      }
    };

    addEssentials(sessionDir, "");
    archive.finalize();
  });
}

// ── Fetch with retry ──────────────────────────────────────────────────────────
async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 2000;
        log("warn", "fetch_retry", { attempt: attempt + 1, delayMs: delay, error: err.message });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ── Backup ────────────────────────────────────────────────────────────────────
let backupInProgress = false;

async function backupSession() {
  if (backupInProgress) {
    log("info", "backup_skipped", { reason: "already_in_progress" });
    return;
  }
  backupInProgress = true;

  try {
    const sessionDir = config.SESSION_DIR;
    if (!fs.existsSync(sessionDir)) {
      log("info", "backup_skipped", { reason: "no_session_directory" });
      return;
    }

    const start = Date.now();
    const zipBuffer = await zipSessionEssentials(sessionDir);
    const base64 = zipBuffer.toString("base64");
    const rawMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
    const base64MB = (base64.length / 1024 / 1024).toFixed(2);
    const zipMs = Date.now() - start;

    if (base64.length > config.BACKUP_MAX_SIZE_MB * 1024 * 1024) {
      log("error", "backup_too_large", {
        base64MB,
        limitMB: config.BACKUP_MAX_SIZE_MB,
      });
      return;
    }

    const uploadStart = Date.now();
    const res = await fetchWithRetry(
      `${config.BACKEND_URL}/api/internal/kv/${config.BACKUP_KEY}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": config.INTERNAL_KEY,
        },
        body: JSON.stringify({ value: base64 }),
        signal: AbortSignal.timeout(60_000),
      },
      2
    );

    const uploadMs = Date.now() - uploadStart;
    if (res.ok) {
      log("info", "backup_success", { rawMB, base64MB, zipMs, uploadMs });
    } else {
      const body = await res.text().catch(() => "");
      log("error", "backup_upload_failed", {
        httpStatus: res.status,
        body: body.slice(0, 300),
      });
    }
  } catch (err) {
    log("error", "backup_failed", { error: err.message });
  } finally {
    backupInProgress = false;
  }
}

// ── Restore ───────────────────────────────────────────────────────────────────
async function restoreSession() {
  const sessionDir = config.SESSION_DIR;

  try {
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      if (files.length > 0) {
        log("info", "restore_skipped", { reason: "local_session_exists" });
        return true;
      }
      log("info", "restore_start", { reason: "local_session_empty" });
    } else {
      log("info", "restore_start", { reason: "no_local_session" });
    }

    const res = await fetchWithRetry(
      `${config.BACKEND_URL}/api/internal/kv/${config.BACKUP_KEY}`,
      {
        headers: { "X-Internal-Key": config.INTERNAL_KEY },
        signal: AbortSignal.timeout(60_000),
      },
      2
    );

    if (res.status === 404) {
      log("info", "restore_skipped", { reason: "no_backup_in_backend" });
      return false;
    }
    if (!res.ok) {
      log("warn", "restore_skipped", { reason: "backend_error", httpStatus: res.status });
      return false;
    }

    const data = await res.json();
    if (!data.value || typeof data.value !== "string" || data.value.length < 100) {
      log("warn", "restore_skipped", { reason: "invalid_backup_payload" });
      return false;
    }

    const sizeMB = (data.value.length / 1024 / 1024).toFixed(2);
    log("info", "restore_extracting", { sizeMB });

    const zipBuffer = Buffer.from(data.value, "base64");
    if (zipBuffer.length < 50) {
      log("error", "restore_failed", { reason: "decoded_buffer_too_small" });
      return false;
    }

    fs.mkdirSync(sessionDir, { recursive: true });

    await new Promise((resolve, reject) => {
      const { Readable } = require("stream");
      Readable.from(zipBuffer)
        .pipe(unzipper.Extract({ path: sessionDir }))
        .on("close", resolve)
        .on("error", reject);
    });

    const restoredFiles = fs.readdirSync(sessionDir);
    if (restoredFiles.length === 0) {
      throw new Error("Restored session directory is empty after extraction");
    }

    log("info", "restore_success", { topLevelEntries: restoredFiles.length });
    return true;
  } catch (err) {
    log("error", "restore_failed", { error: err.message });
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

// ── Clear local session ───────────────────────────────────────────────────────
function clearLocalSession() {
  try {
    if (fs.existsSync(config.SESSION_DIR)) {
      fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
      log("info", "session_cleared", { path: config.SESSION_DIR });
    }
    if (fs.existsSync(config.AUTH_DIR)) {
      for (const item of fs.readdirSync(config.AUTH_DIR)) {
        if (item !== "session") {
          const itemPath = path.join(config.AUTH_DIR, item);
          fs.rmSync(itemPath, { recursive: true, force: true });
        }
      }
    }
  } catch (err) {
    log("error", "session_clear_failed", { error: err.message });
  }
}

module.exports = { backupSession, restoreSession, clearLocalSession };
