/**
 * Fit a meta description into the range search engines display (~155-160 chars).
 *
 * Many pages reuse their visible intro paragraph as the meta description, and
 * those run 190-270 chars, so Google truncates them mid-sentence. Rather than
 * rewrite thousands of strings, keep the leading sentences that fit, so the
 * differentiator up front survives and the snippet ends on a full stop.
 *
 * Descriptions already within the limit are returned untouched.
 */
export const META_DESC_MAX = 155;
// A sentence-boundary result shorter than this is too thin; fall back to a clause/word cut.
const META_DESC_MIN = 100;

export function fitMetaDescription(input: string): string {
  const text = input.replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;

  // 1. Whole leading sentences that fit.
  const sentences = text.match(/[^.!?。]+(?:[.!?。]+|$)\s*/g) ?? [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > META_DESC_MAX) break;
    out += s;
  }
  out = out.trim();
  if (out.length >= META_DESC_MIN) return out;

  // 2. Cut at the last strong clause boundary (; : — –) that leaves a usable length.
  // Commas are excluded: cutting at one can leave a list dangling ("iPhone, iPad.").
  const head = text.slice(0, META_DESC_MAX);
  let cut = -1;
  for (const m of head.matchAll(/[;:—–]\s/g)) {
    if (m.index !== undefined && m.index >= META_DESC_MIN - 15) cut = m.index;
  }
  if (cut > 0) return head.slice(0, cut).trim() + '.';

  // 3. Last resort: cut at a word boundary and mark the truncation.
  const words = text.slice(0, META_DESC_MAX - 1);
  const space = words.lastIndexOf(' ');
  return (space > 0 ? words.slice(0, space) : words)
    .replace(/[\s,;:—–-]+$/, '') + '…';
}
