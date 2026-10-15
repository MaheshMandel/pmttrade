import fs from 'node:fs';
import path from 'node:path';

/**
 * ~1,500 images referenced by how-to/debugging guides (hero images, inline
 * screenshots, og:image, Article schema `image`) don't exist in public/ —
 * screenshots that were never captured. Astro was rendering broken <img> tags
 * and 404 og:image/schema URLs straight through. Since every guide renders via
 * the same GuideArticle/BaseLayout, checking existence here once (build time,
 * against the real public/ dir) fixes all of them without touching the ~365
 * per-page files that declare the (often-missing) paths.
 */
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

export function publicAssetExists(urlPath: string): boolean {
  const clean = urlPath.split('?')[0].split('#')[0];
  if (!clean.startsWith('/')) return false;
  const filePath = path.join(PUBLIC_DIR, clean);
  // Guard against a path escaping public/ (e.g. via encoded "..").
  if (!filePath.startsWith(PUBLIC_DIR)) return false;
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}
