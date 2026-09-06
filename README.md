# Vivaldi Mod Pack

A personal Vivaldi customization pack built on top of **Vivaldi Air**, extending its glass-inspired design with additional UI polish, custom SVG icons, improved spacing and compatibility fixes, and a redesigned vertical tab experience. The mod adds a responsive pinned-tab favicon grid, compact full-width normal tabs, accordion tab groups with an inline waterfall layout, improved hibernated-tab styling, refined hover and active states, and various fixes for panels, bookmarks, menus, workspaces, tab groups, and different tab positions. It is implemented primarily through custom CSS and relies on Vivaldi’s internal UI classes, so some adjustments may be required after major Vivaldi updates.

## What It Changes

The pack keeps the overall Vivaldi Air aesthetic while refining more of the browser chrome for a denser, cleaner, and more consistent interface.

### Vertical tabs

- Responsive favicon-only grid for pinned tabs
- Compact full-width rows for normal tabs
- Accordion tab stacks displayed as an inline waterfall
- Cleaner spacing and alignment for left and right tab bars
- Refined active and hover states
- Hibernated tabs that visually mute the favicon without degrading the whole tab
- Compatibility fixes for alternate tab positions and grouped tabs

### Browser UI

- Glass-style main toolbar treatment
- Refined address and search field states
- Rounded webpage container and clipped page corners
- Restyled sidebar and web panels
- Improved status bar styling
- Refined workspace controls and popup
- Updated Speed Dial surfaces
- Restyled Find in Page interface
- Improved bookmark bar layout and appearance
- Menu, panel, and popup consistency fixes
- Better spacing across several browser UI states

### Custom icons

The `custom-icons` directory contains replacement SVG assets for common browser actions and panels, including navigation, bookmarks, downloads, mail, settings, sidebar controls, sleep / hibernation actions, split view, and more.

## Project Structure

```text
vivaldi-mod-pack/
├── VivaldiAir.css      # Main Vivaldi UI modification stylesheet
├── custom-icons/       # Custom SVG browser icons
└── README.md
```

## Installation

### Custom CSS

1. Download or clone this repository.
2. Open `vivaldi://experiments` in Vivaldi.
3. Enable **Allow for using CSS modifications**.
4. Open **Settings → Appearance**.
5. Under **Custom UI Modifications**, select the folder containing `VivaldiAir.css`.
6. Restart Vivaldi.

Depending on your Vivaldi version and existing setup, you may need to merge this stylesheet with other custom UI modifications rather than use it by itself.

### Custom icons

The SVG files in `custom-icons` can be applied through Vivaldi's theme icon customization tools. Use them individually or as the basis for a matching custom icon set.

## Compatibility

This mod directly targets Vivaldi's internal UI classes and DOM structure. Those selectors are not a stable public API, so major browser updates can rename or restructure elements and temporarily break parts of the customization.

The stylesheet includes fixes and overrides for multiple browser layouts, but future Vivaldi releases may require selector or spacing adjustments.

## Built On

This project is an extension of **Vivaldi Air** rather than a from-scratch browser theme. The goal is to preserve its glass-inspired visual language while adding personal layout changes, denser vertical-tab behavior, icon customization, and compatibility fixes across more of Vivaldi's interface.
