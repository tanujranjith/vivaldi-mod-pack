/* =====================================================================
   Vivaldi Air — TILED (split-screen) tabs SIDE-BY-SIDE  (JS companion mod)

   WHAT IT DOES
   ------------
   Tabs shown split-screen (Page Tiling) sit next to each other in the
   vertical tab bar — sharing one grid row like the pinned favicon tiles —
   instead of each taking a full-width row. Untiled tabs are untouched.

   WHY JS IS NEEDED
   ----------------
   Vivaldi renders NO tiling marker on tab-strip rows (verified against
   bundle.js / common.css: the .tab / .tab-wrapper / .tab-position class
   lists have no tiling key, so no pure-CSS selector can match them).
   What Vivaldi DOES render is, in the page area:
       #webpage-stack .webpageview.tiled[data-id="<pageId>"]
   one per page that is currently part of a multi-tile group (solo pages
   and inactive workspaces render untiled). This script maps those page
   ids onto tab-strip rows and tags them with an `is-tiled` class, which
   the CSS mod's V7 section turns into side-by-side rows.

   MAPPING
   -------
   Tab rows carry `.tab-wrapper[data-id="tab-<pageId>"]`, i.e. the same
   numeric page id with a `tab-` prefix (layout keys are page ids —
   see accordionTab items using `id: page.id`, and drag code comparing
   layout tabIds against String(page.id)). Matching tries `tab-<id>`
   first, then the raw id, so a future Vivaldi format change degrades to
   "no tagging" rather than wrong tagging.

   Classes are only ever ADDED/REMOVED to match current state (never on a
   steady state), so the MutationObserver settles instead of looping, and
   React re-renders that wipe the class get re-tagged on the next pass.

   Requires: tabs on the LEFT/RIGHT (vertical) — same scope as the CSS.
   Load instructions: see tiled-tabs.README.md
   ===================================================================== */

(function () {
  "use strict";

  // Flip to true to log tagging to the UI devtools console.
  const DEBUG = false;

  const TAG = "[tiled-tabs]";
  const ROW_TAG = "is-tiled";
  const log = (...a) => DEBUG && console.log(TAG, ...a);

  let pending = null;

  function schedule(delay = 80) {
    clearTimeout(pending);
    // Debounce until React has committed both the page stack and the tab
    // strip. Further DOM mutations restart this short wait.
    pending = setTimeout(run, delay);
  }

  function run() {
    pending = null;
    try {
      syncTiledRows();
    } catch (e) {
      console.warn(TAG, "error:", e);
    }
  }

  /* Page ids currently rendered as part of a tile group. Solo / hidden /
     inactive-workspace pages render without .tiled, so they never match. */
  function tiledPageIds() {
    const ids = new Set();
    document
      .querySelectorAll('#webpage-stack .webpageview.tiled[data-id]')
      .forEach((el) => {
        const id = el.getAttribute("data-id");
        if (id) ids.add(id);
      });
    return ids;
  }

  function syncTiledRows() {
    const strip = document.querySelector("#tabs-tabbar-container");
    if (!strip) return;

    const tiled = tiledPageIds();

    // Index tab rows by their wrapper id.
    const rows = Array.from(strip.querySelectorAll(".tab-position"));
    const byKey = new Map();
    for (const row of rows) {
      const wrapper = row.querySelector(".tab-wrapper[data-id]");
      if (wrapper) byKey.set(wrapper.getAttribute("data-id"), row);
    }

    // Resolve each tiled page id to its row (prefix-tolerant).
    const wanted = new Set();
    tiled.forEach((pid) => {
      const row =
        byKey.get("tab-" + pid) ||
        byKey.get(pid) ||
        byKey.get("tab-" + String(pid).replace(/^tab-/, "")) ||
        null;
      if (row) wanted.add(row);
      else log("no tab row for tiled page", pid);
    });

    let tagged = 0;
    let untagged = 0;
    for (const row of rows) {
      if (wanted.has(row)) {
        if (!row.classList.contains(ROW_TAG)) {
          row.classList.add(ROW_TAG);
          tagged++;
        }
      } else if (row.classList.contains(ROW_TAG)) {
        row.classList.remove(ROW_TAG);
        untagged++;
      }
    }
    if (tagged || untagged) log("tagged", tagged, "untagged", untagged);
  }

  const obs = new MutationObserver(() => schedule(80));
  let stripObserved = false;
  let stackObserved = false;

  function observe() {
    // Tiling changes mutate the page stack; tab switches / stack
    // expands / re-renders mutate the strip. Watch both.
    if (!stripObserved) {
      const strip = document.querySelector("#tabs-tabbar-container");
      if (strip) {
        obs.observe(strip, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["class"],
        });
        stripObserved = true;
      }
    }
    if (!stackObserved) {
      const stack = document.querySelector("#webpage-stack");
      if (stack) {
        obs.observe(stack, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["class"],
        });
        stackObserved = true;
      } else setTimeout(observe, 2000); // page stack mounts late — retry
    }
  }

  function start() {
    observe();
    log("listening");
    run();
  }

  // The UI mounts asynchronously — wait for the tab strip to exist.
  (function waitForUI(tries) {
    if (document.querySelector("#tabs-tabbar-container")) return start();
    if (tries > 100) return; // ~30s; give up quietly
    setTimeout(() => waitForUI(tries + 1), 300);
  })(0);
})();
