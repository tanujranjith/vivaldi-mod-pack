# Accordion auto-collapse (JS mod) — setup

`accordion-autoclose.js` makes left/right **Accordion Tab Stacks** reliably
collapse when you click away from them. It also keeps a renamed stack's saved
name visible while the stack is expanded. Vivaldi normally replaces the named
header with child tabs in that state, making the group look as if it has been
renamed to the most recently used child. The companion CSS draws the saved
name above the first expanded child instead.

Vivaldi's native auto-collapse can get flaky after a few hours of use and
stop firing — this script re-runs the collapse on every tab switch so it
never wears out.

CSS can't do this (it has no timers or state), which is why it's a `.js` file
and needs the one-time setup below.

## Prerequisites

- Settings → Tabs → Tab Features → **Tab Stacking → Accordion Tab Stacks**
- Tabs positioned on the **left or right** (vertical), same as the CSS mod.

## Install (Windows)

Run `install-js-mod.ps1` (right-click → Run with PowerShell, or from a
terminal). It finds the newest Vivaldi version folder, copies
`accordion-autoclose.js` into `resources\vivaldi\`, and adds the `<script>`
line to `window.html`. It's idempotent — safe to re-run any time.

> **Important:** every Vivaldi update creates a new version folder with a
> fresh `window.html`, which silently removes the mod. The CSS mod survives
> updates (it loads via Settings → Appearance → Custom UI Modifications), but
> that setting only loads CSS — so if auto-collapse stops working after an
> update, just re-run `install-js-mod.ps1`.

## Manual install (what the script does)

Vivaldi loads UI mods by adding a `<script>`/`<link>` tag to its `window.html`.

1. **Find `window.html`.** It lives under your Vivaldi install, in the
   versioned `Application` folder. Typical locations:

   - Per-user install:
     `C:\Users\tanuj\AppData\Local\Vivaldi\Application\<version>\resources\vivaldi\window.html`
   - System install:
     `C:\Program Files\Vivaldi\Application\<version>\resources\vivaldi\window.html`

   `<version>` is a number like `7.1.3570.42`. If there are several, use the
   highest one.

2. **Open `window.html` in a text editor** (run the editor as Administrator if
   it's under `Program Files`).

3. **Copy `accordion-autoclose.js`** into the same `resources\vivaldi\` folder
   as `window.html` (a relative `src` is more reliable than a `file:///` path),
   then **add one line just before `</body>`**:

   ```html
       <script src="accordion-autoclose.js"></script>
     </body>
   ```

4. **Save and fully restart Vivaldi.**

## Verify it works

1. Click a tab group header to expand it.
2. Click any tab outside that group.
3. The group should collapse immediately. It should keep doing this no matter
   how long Vivaldi has been open.

To watch it work, set `const DEBUG = true;` at the top of
`accordion-autoclose.js`, restart, and open the UI devtools console
(`vivaldi://inspect` → inspect the browser window, or the `Ctrl+Shift+I`
UI inspector if enabled). You'll see `[accordion-autoclose] collapsed N
stray stack(s)` lines.

## After a Vivaldi update

Updates install a **new `<version>` folder**, so the old `window.html` edit no
longer applies. Re-run `install-js-mod.ps1` and restart Vivaldi.

## Uninstall

Delete the `<script>` line from `window.html` (and the copied
`accordion-autoclose.js` next to it) and restart.

## Troubleshooting

### A stack stays expanded even though I'm in a different tab

That is this mod not running, not the CSS. Two usual causes:

1. **The script was never installed, or a Vivaldi update wiped it.**
   Updates create a new `<version>` folder with a fresh `window.html`,
   which silently drops the mod. Check: open
   `resources\vivaldi\window.html` in the newest version folder — if there
   is no `accordion-autoclose.js` `<script>` line, re-run
   `install-js-mod.ps1` and fully restart Vivaldi (Exit from the V-menu /
   tray, not just closing the window).
2. **The stack was pinned open** (toggle arrow clicked or the tab
   double-clicked — Vivaldi marks it stay-open and its native logic then
   never auto-collapses it). That is exactly what this script overrides:
   once it is running, click any tab outside the stack and it collapses.

Fail-safe: the CSS only hides Vivaldi's native toggle arrow while this
script is active (it adds an `accordion-autoclose-on` class to `<html>`).
So if the script is missing, the toggle arrow stays visible and you can
still collapse the stuck stack by hand by clicking it.

### I see slim ▼ chevron rows / still no auto-collapse right after install

CSS reloads live, but `<script>` mods only load at Vivaldi startup. Fully
Exit Vivaldi (V-menu / tray — not just closing the window) and reopen;
the chevrons hide themselves once the script signals it is running.
