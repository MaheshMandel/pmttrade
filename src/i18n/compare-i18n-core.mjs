// Compare-page translation core (pure functions; no JSON imports so Node scripts can use it too).
//
// A page is rendered in English, then every "text unit" in it is looked up in a per-locale dictionary
// keyed by a hash of the normalised English. A unit is an element that owns visible text directly and
// whose children are only inline markup; its innerHTML (tags and all) is what gets translated.
// Extraction (build with COMPARE_I18N_DUMP) and runtime replacement use THIS code, so they cannot disagree.
import { createHash } from "node:crypto";

const INLINE = new Set(["a", "span", "strong", "b", "em", "i", "u", "small", "sub", "sup", "time", "code", "mark", "abbr", "kbd", "s", "br", "wbr"]);
const VOID = new Set(["br", "wbr", "img", "input", "hr", "meta", "link", "source", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "use", "stop", "marker"]);
const SKIP = new Set(["script", "style", "noscript", "template"]);
const ATTRS = ["aria-label", "alt", "title", "placeholder"];

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rarr: "→", middot: "·" };
export function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
}
// Astro's dev server annotates elements with data-astro-source-*; ignore them so dev renders match production keys.
const DEV_ATTRS = /\sdata-astro-source-(?:file|loc)="[^"]*"/g;
export const normalize = (s) => decode(s.replace(DEV_ATTRS, "")).replace(/\s+/g, " ").trim();
export const keyOf = (s) => createHash("sha1").update(normalize(s)).digest("hex").slice(0, 12);
const hasLetters = (s) => /\p{L}/u.test(decode(s));
// a bare price such as "$50" or "$1,009.80" (no letters) is still a unit: its number format is localised
const PRICE_ONLY = /^\s*\$\s?\d[\d.,]*\s*$/;

// ---------------------------------------------------------------- parse / serialise
const TOKEN = /<!--[\s\S]*?-->|<\/[a-zA-Z][^>]*>|<[a-zA-Z][^\s/>]*(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g;

export function parse(html) {
  const root = { t: "root", children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  for (const m of html.matchAll(TOKEN)) {
    const tok = m[0];
    if (tok.startsWith("<!--")) top().children.push({ t: "raw", raw: tok });
    else if (tok.startsWith("</")) {
      const name = tok.slice(2, -1).trim().toLowerCase();
      let i = stack.length - 1;
      while (i > 0 && stack[i].name !== name) i--;
      if (i > 0) {
        stack[i].close = tok;
        stack.length = i;
      } else top().children.push({ t: "raw", raw: tok });
    } else if (tok.startsWith("<") && tok.length > 1 && /^<[a-zA-Z]/.test(tok)) {
      const name = /^<([a-zA-Z][^\s/>]*)/.exec(tok)[1].toLowerCase();
      const node = { t: "el", name, open: tok, children: [], close: "" };
      top().children.push(node);
      if (!(tok.endsWith("/>") || VOID.has(name))) stack.push(node);
    } else top().children.push({ t: "text", raw: tok });
  }
  return root;
}

export function serialize(nodes) {
  let out = "";
  for (const n of nodes) {
    if (n.t === "text" || n.t === "raw") out += n.raw;
    else out += n.open + serialize(n.children) + n.close;
  }
  return out;
}

// ---------------------------------------------------------------- walk
function attrOf(open, name) {
  const m = new RegExp(`\\s${name}=("([^"]*)"|'([^']*)')`).exec(open);
  return m ? m[2] ?? m[3] : null;
}

function containsText(el) {
  return el.children.some((c) => (c.t === "text" && hasLetters(c.raw)) || (c.t === "el" && containsText(c)));
}

/** Visit every text unit. visit(kind, el|null, str) may return a replacement string. Returns problems. */
export function walk(root, visit) {
  const problems = [];
  const go = (el) => {
    if (SKIP.has(el.name) || attrOf(el.open, "data-i18n-skip") !== null) return;
    // attributes
    let open = el.open;
    for (const a of ATTRS) {
      const m = new RegExp(`(\\s${a}=)"([^"]*)"`).exec(open);
      if (m && hasLetters(m[2])) {
        const rep = visit("attr", el, m[2]);
        if (typeof rep === "string") open = open.replace(m[0], `${m[1]}"${rep.replace(/"/g, "&quot;")}"`);
      }
    }
    el.open = open;
    const direct = el.children.filter((c) => c.t === "text").map((c) => c.raw).join("");
    if (hasLetters(direct) || PRICE_ONLY.test(decode(direct))) {
      const blockChild = el.children.some((c) => c.t === "el" && !INLINE.has(c.name) && containsText(c));
      if (!blockChild) {
        const inner = serialize(el.children);
        const rep = visit("unit", el, inner);
        if (typeof rep === "string") el.children = [{ t: "raw", raw: rep }];
        return;
      }
      problems.push(`text next to block children in <${el.name}>: ${normalize(direct).slice(0, 60)}`);
    }
    for (const c of el.children) if (c.t === "el") go(c);
  };
  for (const c of root.children) if (c.t === "el") go(c);
  return problems;
}

/** All translatable strings in an HTML fragment: Map(key -> english). */
export function collect(html) {
  const root = parse(html);
  const found = new Map();
  const problems = walk(root, (_kind, _el, str) => {
    found.set(keyOf(str), normalize(str) === str.trim() ? str.trim() : str.replace(/\s+/g, " ").trim());
  });
  return { found, problems };
}

/** Replace units using dict (key -> translation). Returns {html, missing}. */
export function translate(html, dict, known = new Set()) {
  const root = parse(html);
  const missing = new Set();
  walk(root, (_kind, _el, str) => {
    const k = keyOf(str);
    if (dict[k] !== undefined) return dict[k];
    // already translated upstream (page frontmatter runs tr() on descriptions, FAQ, ...): not a miss
    if (!known.has(normalize(str))) missing.add(normalize(str).slice(0, 80));
    return undefined;
  });
  return { html: serialize(root.children), missing };
}

// ---------------------------------------------------------------- links
const CROSS = /^https:\/\/pickmytrade\.(io|trade)(\/.*)$/;
const CROSS_OK = /^\/(compare\/|pages\/pricing|broker|pricing)/;

export function localizeHrefs(html, locale, locales = ["de", "es", "fr", "it"]) {
  if (!locale || locale === "en") return html;
  const pre = (path) => {
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    if (/^\/(_astro|assets|cdn-cgi)\//.test(path) || /\.[a-z0-9]{2,5}([?#]|$)/i.test(path.split("#")[0])) return null;
    if (locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`))) return null;
    return `/${locale}${path}`;
  };
  return html.replace(/(\shref=)"([^"]*)"/g, (m, a, href) => {
    const cm = CROSS.exec(href);
    if (cm) {
      if (!CROSS_OK.test(cm[2])) return m;
      const p = pre(cm[2]);
      return p ? `${a}"https://pickmytrade.${cm[1]}${p}"` : m;
    }
    const p = pre(href);
    return p ? `${a}"${p}"` : m;
  });
}
