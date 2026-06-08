# Vivaldi Air v.26 — Changelog

## Summary

Integrated a compact vertical-tab enhancement **directly into `VivaldiAir.css`**
(no second overlapping stylesheet). The whole feature is scoped to LEFT / RIGHT
vertical tab bars via the `#browser.tabs-left` / `#browser.tabs-right`
`#tabs-tabbar-container .resize` prefix, so horizontal tabs and the rest of the
Vivaldi Air UI are untouched.

## Added

- **Pinned favicon grid** — pinned tabs become favicon-only square tiles in a
  responsive CSS grid (`repeat(auto-fill, minmax(...))`), so the number of icons
  per row tracks the sidebar width. Title / close / audio blob hidden on tiles;
  favicon centered; audio-playing tiles get a subtle ring instead of a popup icon.
- **Full-width normal rows** — unpinned tabs stay full-width rows beneath the
  grid with a `favicon | title | audio | close` layout. Close button appears on
  hover only. Audio / mute indicators stay in-row.
- **Waterfall (inline accordion) tab groups** — relies on Vivaldi's native
  *Accordion Tab Stacks*. Children cascade indented in the same column with a
  group-colour guide rail and a faint group-colour tint; the header keeps its
  colour (rendered as a pill), name and tab-count badge. The native
  `accordion-toggle-arrow` row is removed (no empty spacer/arrow row) and a
  decorative ▶ chevron marks collapsed groups.
- **Hibernated favicon greying** — `.tab.isdiscarded .favicon` is desaturated +
  dimmed (favicon only); restores on hover / activation.
- **Tuning block (`V0. TUNING`)** — `--vpg-*` variables for tile size, favicon
  sizes, radii, grid gap, normal row height, accordion child height/indent,
  guide-rail thickness and hibernated favicon opacity. Radii default to the
  modpack's `--radius`.

## Changed / deliberately overridden

These existing Vivaldi Air rules are intentionally overridden, **only inside the
vertical grid** (higher specificity + `!important`); they remain fully in force
for horizontal tabs:

- `#browser .tab-position.colored .tab:not(.active)` (solid group-colour fill,
  lines ~367–374) — de-filled to transparent on accordion **headers** and
  replaced with a faint tint on accordion **children**, so the group colour is
  carried by the pill + guide rail (Edge-like), not a heavy solid block.
- Hover / active tab background — the standalone prototype used hard-coded
  `rgba(255,255,255,…)`. In the integrated version these reuse the Vivaldi Air
  glass treatment (`var(--bg)` + `var(--blurMed)` / `var(--blurMedHigh)`), so
  light and dark themes both read correctly. **No hard-coded colours added.**
- `.tab-position.accordion-toggle-arrow` — `display:none` inside the vertical
  grid only (it would otherwise stretch into a full-width coloured spacer row).

## Removed

- Nothing was deleted from the original stylesheet. In particular the
  **Two-Level Tab Stack sub-row** rules (`#tabs-subcontainer`,
  `.tabbar-wrapper + .tabbar-wrapper`, etc., ~lines 720–779) were **kept** —
  they only ever apply to *horizontal* two-level stacks, which do not render in
  vertical Accordion mode, so they do not conflict with the new grid and are
  still needed for horizontal-tab users.

## Files

- `VivaldiAir.css` — integrated stylesheet (header bumped to v.26).
- `VivaldiAir.original.css` — untouched backup of the v.25 stylesheet.
- `README.md` — added Update 26 section with setup + tuning + update-caveat docs.
- `CHANGELOG-v26.md` — this file.

## Selectors to re-verify after future Vivaldi updates

Internal (non-public) UI classes the vertical layout depends on:

- `.resize` — the vertical tab-list scroll/layout area
- `.tab-position.is-pinned` (fallbacks: `.pinned`, `[pinned]`)
- `.tab.tab-accordion` / `.tab.tab-group` — group header
- `.tab.tab-in-accordion` — inline accordion child
- `.tab-position.accordion-toggle-arrow` — native toggle row
- `.stack-counter` — group tab-count badge
- `.tab-position.colored` + `--stackColorBg` / `--stackColorFg` — group colour
- `.tab.isdiscarded` — hibernated/discarded tab
- `.audioicon` / `.tab-audio` / `.audio`, `.tab.audio-on` / `.tab.audio-muted`
- `.sync-and-trash-container`, `.newtab`, `.separator`, `.tab-strip`

## Manual test checklist

- **Left vertical tabs:** pinned tabs are favicon-only tiles, tiles wrap into
  multiple columns, normal tabs full-width, new-tab button + trash/sync visible.
- **Right vertical tabs:** same, no clipping or reversed spacing.
- **Accordion stacks:** collapsed group clean (▶ chevron, badge visible),
  expanded children inline + indented with colour rail, no second strip, no empty
  arrow row, colour legible.
- **Hibernated tabs:** only favicon desaturated; title/colour/badge readable;
  restores on hover and on activation.
- **States:** active pinned tile and active normal tab visually distinct; hover
  keeps the Air glass blur.
- **Horizontal tabs:** top and bottom layouts unchanged; two-level stack sub-row
  still themed.
- **Themes:** readable in both dark and light.
- **Window states:** fullscreen, maximized, non-maximized, tabs-hidden, sidebar
  shown/hidden.
