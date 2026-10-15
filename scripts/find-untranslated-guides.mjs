// FE-29: find how-to/ and debugging/ guides whose de/es/fr/it `blocks` are still the
// English text. Those locale pages are emitted as noindex + canonical-to-English and
// left out of the sitemap (see BaseLayout.astro and astro.config.mjs). Once a guide is
// really translated its `blocks` no longer match English and it drops out of the list
// on the next run. Output: src/data/untranslatedGuides.json
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = path.join(ROOT, "src/pages/[...locale]");
const out = {};

for (const section of ["how-to", "debugging"]) {
  for (const file of readdirSync(path.join(PAGES, section))) {
    if (!file.endsWith(".astro") || file === "index.astro") continue;
    const src = readFileSync(path.join(PAGES, section, file), "utf8");
    const m = src.match(/blocks: \{ en: \[([\s\S]*?)\]\s*\},\s*ctaHeading/);
    if (!m) continue;
    const parts = m[1].split(/\],\s*(de|es|fr|it): \[/);
    const en = parts[0].trim();
    const untranslated = [];
    for (let i = 1; i < parts.length - 1; i += 2) {
      if (parts[i + 1].trim() === en) untranslated.push(parts[i]);
    }
    if (untranslated.length) out[`${section}/${file.replace(/\.astro$/, "")}`] = untranslated.sort();
  }
}

mkdirSync(path.join(ROOT, "src/data"), { recursive: true });
writeFileSync(path.join(ROOT, "src/data/untranslatedGuides.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`[untranslated-guides] ${Object.keys(out).length} guides have untranslated locales`);
