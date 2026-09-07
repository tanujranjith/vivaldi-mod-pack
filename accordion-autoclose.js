/* =====================================================================
   Vivaldi Air — Accordion Tab-Stack AUTO-COLLAPSE  (JS companion mod)

   WHY THIS EXISTS
   ---------------
   The "click into a group, click away, it collapses" behaviour is
   Vivaldi's OWN native accordion logic — the CSS mod only styles it, it
   does not drive it. Native auto-collapse is unreliable: it works for a
   while, then after extended use (lots of DOM churn) it stops firing, so
   a group you left stays expanded. CSS cannot fix this (no timers, no
   state — a rule either matches or it doesn't), so we re-implement the
   collapse explicitly in JS.

    WHAT IT DOES
    ------------
    On every tab activation (chrome.tabs.onActivated — i.e. exactly when
    you "click away" to another tab) it finds every EXPANDED accordion
    stack that does NOT contain the now-active tab and collapses it by
    firing the stack's native toggle control. Because it re-runs on every
    switch, it never "wears out" the way the native path does. It also
    collapses manually pinned-open stacks (Vivaldi's native logic keeps
    those open forever), since "click away closes" is the whole point.

    Two guards keep it from fighting you:
    - It only acts when the ACTIVE TAB changed. Expanding a stack just to
      peek inside (no tab switch) is left alone until you click away.
    - It adds an `accordion-autoclose-on` class to <html> so the CSS mod
      only hides the native toggle arrow while this script is running.
      Without the script, the toggle stays visible for manual collapse.

   Requires: Settings > Tabs > Tab Features > Tab Stacking > Accordion
   Tab Stacks, with tabs on the LEFT/RIGHT (vertical) — same scope as the
   CSS mod's V4 accordion section.

   Load instructions: see accordion-autoclose.README.md
   ===================================================================== */

(function () {
  "use strict";

  // Signal to the CSS mod that this companion is active. The CSS only hides
  // the native accordion toggle arrow when this class is present, so if this
  // script is missing (or was wiped by a Vivaldi update) the user keeps the
  // native toggle and can still collapse stacks by hand. Set synchronously
  // at script eval, before Vivaldi's React UI mounts.
  document.documentElement.classList.add("accordion-autoclose-on");

  // Flip to true to log what the mod does to the UI devtools console
  // (Vivaldi: open vivaldi://inspect or the UI devtools and watch console).
  const DEBUG = false;

  const TAG = "[accordion-autoclose]";
  const log = (...a) => DEBUG && console.log(TAG, ...a);

  let pending = null;

  // data-id of the active tab the last time we evaluated. Collapse only runs
  // when the active tab actually CHANGED (i.e. the user "clicked away").
  // Without this guard, the MutationObserver run triggered by expanding a
  // stack (which mutates the DOM without switching tabs) would instantly
  // re-collapse the stack you just opened to peek inside.
  let lastActiveKey = null;

  function schedule(delay = 50) {
    clearTimeout(pending);
    // Debounce until Vivaldi's React render has moved the .active and
    // .expanded classes. Further DOM mutations restart this short wait.
    pending = setTimeout(run, delay);
  }

  function run() {
    pending = null;
    try {
      collapseStrayStacks();
      syncExpandedGroupLabels();
    } catch (e) {
      console.warn(TAG, "error:", e);
    }
  }

  /* Vivaldi replaces an expanded accordion stack's named header with its
     child rows. The saved name is still present in each child's tab metadata
     (`vivExtData.fixedGroupTitle`), but it is not rendered. Stamp it onto the
     first child so the CSS can draw a stable group label above that row.

     chrome.tabs.query returns the same tab metadata Vivaldi's own UI uses.
     Some Vivaldi versions serialize vivExtData as JSON, so accept both forms.
     This intentionally only labels *named* groups: ordinary unnamed stacks
     keep Vivaldi's normal compact accordion appearance. */
  function syncExpandedGroupLabels() {
    if (!window.chrome || !chrome.tabs || !chrome.tabs.query) return;

    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        log("could not read tab metadata", chrome.runtime.lastError.message);
        return;
      }

      const groupsByTabId = new Map();
      for (const tab of tabs || []) {
        const metadata = readVivaldiMetadata(tab);
        const groupId = metadata.group;
        const title = metadata.fixedGroupTitle;
        if (groupId && typeof title === "string" && title.trim()) {
          groupsByTabId.set(String(tab.id), {
            groupId: String(groupId),
            title: title.trim(),
          });
        }
      }

      const container = document.querySelector("#tabs-tabbar-container");
      if (!container) return;

      for (const row of container.querySelectorAll(".tab-position")) {
        const tab = row.querySelector(".tab.tab-in-accordion");
        const wrapper = row.querySelector(".tab-wrapper[data-id]");
        const tabId = wrapper && wrapper.dataset.id
          ? wrapper.dataset.id.replace(/^tab-/, "")
          : "";
        const group = tabId ? groupsByTabId.get(tabId) : null;
        const isFirstChild = Boolean(
          tab && tab.classList.contains("tab-first-in-group")
        );
        const shouldLabel = Boolean(group && isFirstChild);

        row.classList.toggle("vpg-accordion-named-group-first", shouldLabel);
        if (shouldLabel) {
          row.dataset.vpgGroupTitle = group.title;
          row.dataset.vpgGroupId = group.groupId;
        } else {
          delete row.dataset.vpgGroupTitle;
          delete row.dataset.vpgGroupId;
        }
      }
    });
  }

  function readVivaldiMetadata(tab) {
    const raw = tab && tab.vivExtData;
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    if (typeof raw !== "string") return {};
    try {
      return JSON.parse(raw);
    } catch (_) {
      return {};
    }
  }

  /* Vivaldi exposes the complete accordion state on its native toggle row:
       .accordion-toggle-arrow.expanded  stack is open
       .accordion-toggle-arrow.closed    stack is closed
     An expanded stack's toggle follows its contiguous .tab-in-accordion
     child rows in the ordered .tab-position list. We use that flat list
     instead of element siblings because Vivaldi may wrap tab rows in tooltip
     elements. The toggle's own .active class does NOT reliably say whether a
     child in the stack is active. */
  function collapseStrayStacks() {
    const container = document.querySelector("#tabs-tabbar-container");
    if (!container) return;

    // React briefly removes .active from the old row before applying it to
    // the new one. Never collapse during that in-between render.
    const activeWrapper = container.querySelector(
      ".tab-wrapper.active[data-id]"
    );
    if (!activeWrapper) {
      log("waiting for active tab render");
      return;
    }
    const activeTabKey = activeWrapper.dataset.id;

    // No tab switch since the last pass (e.g. the mutation was just a stack
    // expanding/collapsing, a drag, or a pin toggle) — leave stacks alone so
    // a manually expanded stack can be peeked into without switching tabs.
    if (activeTabKey === lastActiveKey) return;
    lastActiveKey = activeTabKey;

    let collapsed = 0;
    const rows = Array.from(container.querySelectorAll(".tab-position"));
    for (let index = 0; index < rows.length; index++) {
      const toggle = rows[index];
      if (
        !toggle.classList.contains("accordion-toggle-arrow") ||
        !toggle.classList.contains("expanded")
      ) {
        continue;
      }
      if (stackContainsActiveTab(rows, index, activeTabKey)) continue;
      fireToggle(toggle);
      collapsed++;
    }
    if (collapsed) log("collapsed", collapsed, "stray stack(s)");
  }

  function stackContainsActiveTab(rows, toggleIndex, activeTabKey) {
    // In Vivaldi's rendered order, an open accordion is:
    //   child, child, ... child, accordion-toggle-arrow.expanded
    // Scan only that preceding run in the flat row list so another stack's
    // active tab can never protect this one from closing.
    for (let index = toggleIndex - 1; index >= 0; index--) {
      const row = rows[index];
      const child = row.querySelector(".tab.tab-in-accordion");
      if (!child) break;
      const wrapper = row.querySelector(".tab-wrapper[data-id]");
      if (wrapper && wrapper.dataset.id === activeTabKey) return true;
      if (!wrapper && child.classList.contains("active")) return true;
    }
    return false;
  }

  /* Collapse a stack via its native toggle row. We deliberately use the
     toggle (a pure expand/collapse control) and never the header tab,
     because clicking a header can re-activate a tab inside the group and
     yank focus back — the opposite of "click away to close". The toggle
     is display:none, but programmatic events still dispatch + bubble to
     Vivaldi's (React) delegated handlers regardless of rendering. */
  function fireToggle(toggleRow) {
    // The current Vivaldi UI attaches React's onClick to this div itself.
    // HTMLElement.click() works even though our CSS visually hides the row.
    toggleRow.click();
  }

  function start() {
    // The API provides a fallback trigger. Its event can arrive before React
    // updates the tab strip, so wait longer and let the observer below replace
    // it with a shorter, correctly-timed run when the DOM actually changes.
    if (window.chrome && chrome.tabs && chrome.tabs.onActivated) {
      chrome.tabs.onActivated.addListener(() => schedule(180));
      log("listening on chrome.tabs.onActivated");
    }

    // Always observe the rendered state. This is what makes the action
    // reliable when React commits later than the activation API event.
    const container = document.querySelector("#tabs-tabbar-container");
    new MutationObserver(() => schedule(50)).observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    log("listening via MutationObserver");

    run(); // tidy up whatever state we loaded into
  }

  // The UI mounts asynchronously — wait for the tab strip to exist.
  (function waitForUI(tries) {
    if (document.querySelector("#tabs-tabbar-container")) return start();
    if (tries > 100) return; // ~30s; give up quietly
    setTimeout(() => waitForUI(tries + 1), 300);
  })(0);
})();
