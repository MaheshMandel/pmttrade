// Single source of truth for the sale end date.
//
// Change this ONE value to start/end a sale. Everything that depends on the sale
// reads from here (or from the `window.SALE_END` global derived from it):
//   - the sale banner show/hide + countdown (BaseLayout.astro)
//   - the standalone banner visibility guard (Banner.astro)
//   - dynamic pricing: discounted prices show while the sale is live and
//     automatically revert to regular prices once it ends (script.js)
//
// ISO 8601 with an explicit offset so the cutover happens at the same instant
// for every visitor regardless of their local timezone.
export const SALE_END = "2026-09-17T10:00:00+05:30";
