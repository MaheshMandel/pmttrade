// Converts every PNG/JPG under public/assets to a sibling .webp file.
// Skips a file if its .webp sibling already exists and is newer than the source.
// Run with: npm run optimize-images

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const sources = await walk(ROOT);
let converted = 0;
let skipped = 0;

for (const source of sources) {
  const webpPath = source.replace(/\.(png|jpe?g)$/i, ".webp");
  const sourceStat = await stat(source);
  const webpStat = await stat(webpPath).catch(() => null);

  if (webpStat && webpStat.mtimeMs >= sourceStat.mtimeMs) {
    skipped++;
    continue;
  }

  await sharp(source).webp({ quality: 82 }).toFile(webpPath);
  converted++;
  console.log(`converted: ${path.relative(ROOT, source)} -> ${path.relative(ROOT, webpPath)}`);
}

console.log(`\n${converted} converted, ${skipped} already up to date.`);
