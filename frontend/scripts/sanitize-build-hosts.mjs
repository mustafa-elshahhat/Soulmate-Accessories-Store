import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distRoot = join(process.cwd(), 'dist', 'frontend');
const replacementOrigin = 'https://soulmate-accessories-store.vercel.app';
const extensions = new Set(['.html', '.js', '.mjs']);

function extensionOf(path) {
  const dot = path.lastIndexOf('.');
  return dot === -1 ? '' : path.slice(dot);
}

function sanitizeFile(path) {
  if (!extensions.has(extensionOf(path))) return;

  const original = readFileSync(path, 'utf8');
  const sanitized = original
    .replaceAll('http://localhost', replacementOrigin)
    .replaceAll('127.0.0.1/8', '127.0.0.0/8');

  if (sanitized !== original) {
    writeFileSync(path, sanitized);
  }
}

function walk(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }
    return;
  }

  sanitizeFile(path);
}

walk(distRoot);
