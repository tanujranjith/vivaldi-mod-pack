# Tiled (split-screen) tabs side-by-side (JS mod) — setup

`tiled-tabs.js` makes tabs currently shown split-screen (Page Tiling) sit
next to each other in the left/right vertical tab bar — sharing one grid
row like the pinned favicon tiles — instead of each taking a full-width
row. Untiled tabs are untouched.

CSS alone cannot do this: Vivaldi renders no tiling marker on tab-strip
rows, so no selector can match them. The script reads the marker Vivaldi
does render (`#webpage-stack .webpageview.tiled`), maps those page ids
onto tab-strip rows, and tags them `is-tiled`; the CSS mod's V7 section
does the rest. Details in the header comment of `tiled-tabs.js`.

## Prerequisites

- Tabs positioned on the **left or right** (vertical), same as the CSS mod.
- The `VivaldiAir.css` mod (V7 section) for the actual side-by-side styling.

## Install (Windows)

Run `install-js-mod.ps1` (right-click → Run with PowerShell, or from a
terminal). It finds the newest Vivaldi version folder, copies the JS
companions (`accordion-autoclose.js`, `tiled-tabs.js`) into
`resources\vivaldi\`, and adds the `<script>` lines to `window.html`.
It's idempotent — safe to re-run any time.

> **Important:** every Vivaldi update creates a new version folder with a
> fresh `window.html`, which silently removes the mods. If side-by-side
> tiling stops working after an update, just re-run `install-js-mod.ps1`.

## Verify it works

1. Select two tabs → right-click → **Tile Vertically / Horizontally**.
2. In the vertical tab bar, those two tabs should now share one row,
   with a subtle highlight ring. Untiled tabs stay full-width rows.
3. Untile them — they return to full-width rows within a moment.

To watch it work, set `const DEBUG = true;` at the top of
`tiled-tabs.js`, restart, and open the UI devtools console. You'll see
`[tiled-tabs] tagged N untagged M` lines.

## Tuning

In `VivaldiAir.css` (`:root`, V7 section):

- `--vpg-tiled-span` — grid tracks per tiled tab (default `2`). Higher =
  wider cells; pairs may stop sharing a row if the span exceeds half the
  available tracks.
- `--vpg-tiled-font-size` — title size in the narrow cell (`11px`).
- `--vpg-tiled-ring` — highlight ring colour.

## Uninstall

Delete the `<script src="tiled-tabs.js">` line from `window.html` (and
the copied `tiled-tabs.js` next to it) and restart.
