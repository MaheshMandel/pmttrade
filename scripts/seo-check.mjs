// SEO regression gate — run after `astro build` (`npm run build && npm run seo-check`).
// Fails (non-zero exit) if it finds a real defect. See CRAWL-16.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

function walkHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkHtml(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

function routeFromDistPath(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  return "/" + rel;
}

function distPathExists(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0].split("#")[0]);
  if (clean === "/") return existsSync(path.join(DIST, "index.html"));
  const stripped = clean.replace(/^\//, "").replace(/\/$/, "");
  return (
    existsSync(path.join(DIST, `${stripped}.html`)) ||
    existsSync(path.join(DIST, stripped, "index.html")) ||
    existsSync(path.join(DIST, stripped)) // non-HTML static asset
  );
}

// public/assets/404.html is Cloudflare Pages' directory-scoped fallback for
// missing static assets (a plain error response, not a real page) — exclude
// it from page-level checks like every other real 404.html would fail on.
const htmlFiles = walkHtml(DIST).filter((f) => routeFromDistPath(f) !== "/assets/404.html");
ok(`found ${htmlFiles.length} built HTML pages`);

// ---- 1. Internal links resolve to real files ----
let brokenLinks = 0;
const hrefRe = /\s(?:href|src)="([^"]+)"/g;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(hrefRe)) {
    const href = m[1];
    if (href.startsWith("//")) continue; // protocol-relative external
    if (!href.startsWith("/")) continue; // external, mailto:, tel:, #, data: etc.
    if (href.startsWith("/api/")) continue;
    if (!distPathExists(href)) {
      brokenLinks++;
      if (brokenLinks <= 25) {
        console.error(`  broken internal link in ${routeFromDistPath(file)}: ${href}`);
      }
    }
  }
}
if (brokenLinks) fail(`${brokenLinks} internal link(s) point to non-existent pages/assets`);
else ok("all internal links resolve to real files");

// ---- 2. Exactly one self-consistent canonical tag per page ----
let canonicalIssues = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const canonicals = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/g)];
  const route = routeFromDistPath(file);
  if (canonicals.length === 0) {
    canonicalIssues++;
    if (canonicalIssues <= 25) console.error(`  missing canonical tag: ${route}`);
  } else if (canonicals.length > 1) {
    canonicalIssues++;
    if (canonicalIssues <= 25) console.error(`  multiple canonical tags (${canonicals.length}): ${route}`);
  }
}
if (canonicalIssues) fail(`${canonicalIssues} page(s) with missing or duplicate canonical tags`);
else ok("every page has exactly one canonical tag");

// ---- 3. Sitemap only lists real, indexable URLs ----
const sitemapFiles = readdirSync(DIST).filter((f) => /^sitemap.*\.xml$/.test(f) && f !== "sitemap-index.xml");
let sitemapIssues = 0;
let sitemapUrlCount = 0;
for (const sf of sitemapFiles) {
  const xml = readFileSync(path.join(DIST, sf), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  sitemapUrlCount += locs.length;
  for (const loc of locs) {
    let pathname;
    try {
      pathname = new URL(loc).pathname;
    } catch {
      sitemapIssues++;
      console.error(`  malformed sitemap URL: ${loc}`);
      continue;
    }
    if (!distPathExists(pathname)) {
      sitemapIssues++;
      if (sitemapIssues <= 25) console.error(`  sitemap URL has no matching page: ${loc}`);
      continue;
    }
    const stripped = pathname.replace(/^\//, "").replace(/\/$/, "");
    const file = existsSync(path.join(DIST, `${stripped}.html`))
      ? path.join(DIST, `${stripped}.html`)
      : path.join(DIST, stripped, "index.html");
    if (existsSync(file)) {
      const html = readFileSync(file, "utf8");
      if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
        sitemapIssues++;
        if (sitemapIssues <= 25) console.error(`  noindex page listed in sitemap: ${loc}`);
      }
    }
  }
}
if (sitemapIssues) fail(`${sitemapIssues} sitemap entr(y/ies) point to missing or noindex pages`);
else ok(`sitemap (${sitemapUrlCount} URLs) contains only real, indexable pages`);

// ---- 4. Duplicate <title> across non-locale-variant pages ----
const titleMap = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<title>([^<]*)<\/title>/);
  if (!m) continue;
  const title = m[1].trim();
  const route = routeFromDistPath(file);
  if (!titleMap.has(title)) titleMap.set(title, []);
  titleMap.get(title).push(route);
}
// Group routes that are locale-variants of the same page (strip leading /xx/) so
// legitimate per-locale identical titles (rare, but not a bug) don't false-positive
// against genuinely distinct pages sharing a title.
const LOCALE_PREFIX = /^\/(de|es|fr|it)\//;
let dupTitleIssues = 0;
for (const [title, routes] of titleMap) {
  if (routes.length < 2) continue;
  const canonicalized = new Set(routes.map((r) => r.replace(LOCALE_PREFIX, "/")));
  if (canonicalized.size > 1) {
    dupTitleIssues++;
    if (dupTitleIssues <= 15) {
      console.error(`  duplicate <title> "${title}" across distinct pages: ${routes.slice(0, 6).join(", ")}${routes.length > 6 ? ", ..." : ""}`);
    }
  }
}
if (dupTitleIssues) fail(`${dupTitleIssues} title(s) duplicated across distinct (non-locale-variant) pages`);
else ok("no duplicate <title> across distinct pages");

// ---- 5. _redirects: no chains, no dead internal targets ----
const redirectsPath = path.join(ROOT, "public", "_redirects");
if (existsSync(redirectsPath)) {
  const rules = readFileSync(redirectsPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/))
    .filter((p) => p.length >= 2)
    .map(([from, to, status]) => ({ from, to, status: status || "301" }));

  const sources = new Set(rules.map((r) => r.from));
  const chains = rules.filter((r) => sources.has(r.to) && r.to !== r.from);
  if (chains.length) {
    fail(`${chains.length} redirect chain(s) in _redirects (target is itself a redirect source)`);
    chains.slice(0, 15).forEach((r) => console.error(`  ${r.from} -> ${r.to} -> ...`));
  } else {
    ok(`_redirects (${rules.length} rules) has no chains`);
  }

  let deadTargets = 0;
  for (const r of rules) {
    if (!r.to.startsWith("/")) continue; // external URL
    if (r.to.includes(":slug") || r.to.includes(":splat")) continue; // dynamic
    if (/\.\w+$/.test(r.to) && !r.to.endsWith(".html")) continue; // non-HTML asset (xml, json, etc.) — existence not checked here
    if (!distPathExists(r.to.replace(/\.html$/, ""))) {
      deadTargets++;
      if (deadTargets <= 15) console.error(`  redirect target has no matching page: ${r.from} -> ${r.to}`);
    }
  }
  if (deadTargets) fail(`${deadTargets} redirect(s) point to a non-existent internal page`);
  else ok("all static-path redirect targets resolve to real pages");
} else {
  ok("no public/_redirects file present (nothing to check)");
}

// ---- 6. i18n key parity: every default-locale key exists in every other locale ----
const i18nDir = path.join(ROOT, "src", "i18n", "locales");
if (existsSync(i18nDir)) {
  function flatten(obj, prefix = "") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
      else out[key] = v;
    }
    return out;
  }
  const files = readdirSync(i18nDir).filter((f) => f.endsWith(".json"));
  if (files.includes("en.json")) {
    const en = flatten(JSON.parse(readFileSync(path.join(i18nDir, "en.json"), "utf8")));
    let i18nIssues = 0;
    for (const f of files) {
      if (f === "en.json") continue;
      const data = flatten(JSON.parse(readFileSync(path.join(i18nDir, f), "utf8")));
      const missing = Object.keys(en).filter((k) => !(k in data));
      if (missing.length) {
        i18nIssues += missing.length;
        console.error(`  ${f}: ${missing.length} key(s) missing (silently falls back to English): ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ", ..." : ""}`);
      }
    }
    if (i18nIssues) fail(`${i18nIssues} total missing i18n key(s) across non-default locales`);
    else ok(`i18n key parity OK across ${files.length - 1} non-default locale(s)`);
  }
}

console.log("");
if (failures) {
  console.error(`SEO check FAILED: ${failures} issue category/categories found.`);
  process.exit(1);
} else {
  console.log("SEO check PASSED: no regressions found.");
}
