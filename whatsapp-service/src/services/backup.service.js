const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");
const config = require("../config");

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
  "Default\GPUCache",
  "Default\DawnCache",
  "Default\GrShaderCache",
  "Default\ShaderCache",
  "Default\blob_storage",
  "Default\Code Cache",
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

async function zipSessionEssentials(sessionDir) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const archive = archiver("zip", { zlib: { level: 6 }, store: false });
    archive.on("data", (chunk) => buffers.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(buffers)));
    archive.on("error", reject);
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("Archive warning (skipping):", err.message);
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

async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 2000;
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

let backupInProgress = false;

async function backupSession() {
  if (backupInProgress) {
    console.log("[backup] Already in progress, skipping");
    return;
  }
  backupInProgress = true;

  try {
    const sessionDir = config.SESSION_DIR;
    if (!fs.existsSync(sessionDir)) {
      console.log("[backup] No session directory to backup");
      return;
    }

    const start = Date.now();
    const zipBuffer = await zipSessionEssentials(sessionDir);
    const base64 = zipBuffer.toString("base64");
    const rawMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
    const base64MB = (base64.length / 1024 / 1024).toFixed(2);
    const zipMs = Date.now() - start;

    if (base64.length > config.BACKUP_MAX_SIZE_MB * 1024 * 1024) {
      console.error(`[backup] Session backup too large (${base64MB}MB base64 > ${config.BACKUP_MAX_SIZE_MB}MB limit), skipping`);
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
        signal: AbortSignal.timeout(60000),
      },
      2
    );

    const uploadMs = Date.now() - uploadStart;
    if (res.ok) {
      console.log(`[backup] Session backed up OK (raw:${rawMB}MB, b64:${base64MB}MB, zip:${zipMs}ms, upload:${uploadMs}ms)`);
    } else {
      const body = await res.text().catch(() => "");
      console.error(`[backup] Backup failed: HTTP ${res.status} - ${body.slice(0, 300)}`);
    }
  } catch (err) {
    console.error("[backup] Backup failed:", err.message);
  } finally {
    backupInProgress = false;
  }
}

async function restoreSession() {
  const sessionDir = config.SESSION_DIR;

  try {
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      if (files.length > 0) {
        console.log("[restore] Local session exists, skipping restore");
        return true;
      }
      console.log("[restore] Local session directory empty, will attempt restore");
    }

    console.log("[restore] No local session, attempting restore from backend...");
    const res = await fetchWithRetry(
      `${config.BACKEND_URL}/api/internal/kv/${config.BACKUP_KEY}`,
      {
        headers: { "X-Internal-Key": config.INTERNAL_KEY },
        signal: AbortSignal.timeout(60000),
      },
      2
    );

    if (res.status === 404) {
      console.log("[restore] No session backup found in backend (404)");
      return false;
    }

    if (!res.ok) {
      console.log(`[restore] Backend returned HTTP ${res.status}, skipping restore`);
      return false;
    }

    const data = await res.json();
    if (!data.value || typeof data.value !== "string" || data.value.length < 100) {
      console.log("[restore] Session backup is empty/invalid");
      return false;
    }

    const sizeMB = (data.value.length / 1024 / 1024).toFixed(2);
    console.log(`[restore] Restoring session backup (${sizeMB}MB)...`);

    const zipBuffer = Buffer.from(data.value, "base64");
    if (zipBuffer.length < 50) {
      console.error("[restore] Decoded buffer too small, likely corrupted");
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

    console.log(`[restore] Session restored from backend successfully (${restoredFiles.length} top-level entries)`);
    return true;
  } catch (err) {
    console.error("[restore] Session restore failed:", err.message);
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

function clearLocalSession() {
  try {
    if (fs.existsSync(config.SESSION_DIR)) {
      fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
      console.log("[session] Cleared local session directory");
    }
    if (fs.existsSync(config.AUTH_DIR)) {
      const remaining = fs.readdirSync(config.AUTH_DIR);
      for (const item of remaining) {
        const itemPath = path.join(config.AUTH_DIR, item);
        if (item !== "session") {
          fs.rmSync(itemPath, { recursive: true, force: true });
        }
      }
    }
  } catch (err) {
    console.error("[session] Failed to clear local session:", err.message);
  }
}

module.exports = {
  backupSession,
  restoreSession,
  clearLocalSession,
};
