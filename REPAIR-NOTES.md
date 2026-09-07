# Missing styling after moving the project

Vivaldi's Custom UI Modifications setting stores an absolute folder path.
Moving this project does not update that setting. If the folder disappears,
the pinned favicon grid and custom accordion styling cannot load, even when
the JavaScript companions are installed correctly.

On September 7, 2026, the configured folder was missing:

`D:\Desktop\coding\Projects\vivaldi-mod-pack\vivaldi_pinned_favicon_grid_mod_pack`

A Windows directory junction now connects that old location to:

`D:\Desktop\Engineering\Coding\Active projects\vivaldi-mod-pack\vivaldi_pinned_favicon_grid_mod_pack`

Both paths access the same files; this is not a second copy of the mod.
The installed accordion and tiled-tab scripts were verified to match this
project. No stylesheet rollback or browser-profile edit was needed.

Fully exit Vivaldi and reopen it to load the restored stylesheet and scripts.
The folder resolution was verified, but the rendered browser layout still
needs to be checked after restarting.

If this project moves again, update Settings > Appearance > Custom UI
Modifications to the folder containing `VivaldiAir.css`, then restart Vivaldi.
Re-running `install-js-mod.ps1` only installs the JavaScript companions; it
does not update the custom CSS folder setting.
