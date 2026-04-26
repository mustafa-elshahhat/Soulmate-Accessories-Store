const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");
const config = require("../config");

const ESSENTIAL_DIRS = new Set(["IndexedDB", "Local Storage", "Session Storage"]);
const ESSENTIAL_FILES = new Set(["Preferences", "Cookies", "Cookies-journal"]);

function isEssentialPath(entryName) {
  return ESSENTIAL_DIRS.has(entryName) || ESSENTIAL_FILES.has(entryName);
}

async function zipSessionEssentials(sessionDir) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("data", (chunk) => buffers.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(buffers)));
    archive.on("error", reject);

    const addEssentials = (dir, prefix) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch { return; }
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const archivePath = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          if (!prefix || prefix === "Default") {
            if (entry.name === "Default" || isEssentialPath(entry.name)) {
              addEssentials(fullPath, archivePath);
            }
          } else {
            addEssentials(fullPath, archivePath);
          }
        } else {
          if (!prefix || prefix === "Default") {
            if (isEssentialPath(entry.name)) {
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

let backupInProgress = false;

async function backupSession() {
  if (backupInProgress) {
    console.log("Backup already in progress, skipping");
    return;
  }
  backupInProgress = true;

  try {
    const sessionDir = path.join(config.AUTH_DIR, "session");
    if (!fs.existsSync(sessionDir)) {
      console.log("No session directory to backup");
      return;
    }

    const start = Date.now();
    const zipBuffer = await zipSessionEssentials(sessionDir);
    const base64 = zipBuffer.toString("base64");
    const sizeMB = (base64.length / 1024 / 1024).toFixed(2);
    const zipMs = Date.now() - start;

    if (base64.length > 50 * 1024 * 1024) {
      console.error("Session backup too large (>50MB base64), skipping");
      return;
    }

    const uploadStart = Date.now();
    const res = await fetch(`${config.BACKEND_URL}/api/internal/kv/${config.BACKUP_KEY}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": config.INTERNAL_KEY,
      },
      body: JSON.stringify({ value: base64 }),
      signal: AbortSignal.timeout(30000),
    });

    const uploadMs = Date.now() - uploadStart;
    if (res.ok) {
      console.log(`Session backed up OK (${sizeMB}MB, zip:${zipMs}ms, upload:${uploadMs}ms)`);
    } else {
      const body = await res.text().catch(() => "");
      console.error(`Backup failed: HTTP ${res.status} - ${body.slice(0, 300)}`);
    }
  } catch (err) {
    console.error("Backup failed:", err.message);
  } finally {
    backupInProgress = false;
  }
}

async function restoreSession() {
  try {
    const sessionDir = path.join(config.AUTH_DIR, "session");
    if (fs.existsSync(sessionDir)) {
      console.log("Local session exists, skipping restore");
      return true;
    }

    console.log("No local session, attempting restore from backend...");
    const res = await fetch(`${config.BACKEND_URL}/api/internal/kv/${config.BACKUP_KEY}`, {
      headers: { "X-Internal-Key": config.INTERNAL_KEY },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.log(`No session backup in backend (HTTP ${res.status})`);
      return false;
    }

    const data = await res.json();
    if (!data.value || data.value.length < 100) {
      console.log("Session backup is empty/invalid");
      return false;
    }

    const sizeMB = (data.value.length / 1024 / 1024).toFixed(2);
    console.log(`Restoring session backup (${sizeMB}MB)...`);

    const zipBuffer = Buffer.from(data.value, "base64");
    fs.mkdirSync(sessionDir, { recursive: true });

    await new Promise((resolve, reject) => {
      const { Readable } = require("stream");
      Readable.from(zipBuffer)
        .pipe(unzipper.Extract({ path: sessionDir }))
        .on("close", resolve)
        .on("error", reject);
    });

    console.log("Session restored from backend successfully");
    return true;
  } catch (err) {
    console.error("Session restore failed:", err.message);
    const sessionDir = path.join(config.AUTH_DIR, "session");
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    return false;
  }
}

module.exports = {
  backupSession,
  restoreSession,
};
