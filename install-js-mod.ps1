# Installs the JS companion mods into the current Vivaldi version folder.
#
# Vivaldi updates create a NEW <version> folder with a fresh window.html, which
# silently drops the <script> lines (the CSS mod survives because it loads via
# Settings > Appearance > Custom UI Modifications, but that only loads CSS).
# Re-run this script after every Vivaldi update. It is idempotent.
#
# Usage:  powershell -ExecutionPolicy Bypass -File install-js-mod.ps1

$ErrorActionPreference = "Stop"

$modFiles = @(
    "accordion-autoclose.js",
    "tiled-tabs.js"
)
foreach ($mod in $modFiles) {
    if (-not (Test-Path (Join-Path $PSScriptRoot $mod))) { throw "$mod not found next to this script." }
}

# Locate the Vivaldi Application directory (per-user install first).
$appDirs = @(
    (Join-Path $env:LOCALAPPDATA "Vivaldi\Application"),
    "C:\Program Files\Vivaldi\Application"
) | Where-Object { Test-Path $_ }
if (-not $appDirs) { throw "No Vivaldi installation found." }
# Force array context: a single Where-Object match collapses to a scalar
# string, and [0] on a string returns its first CHARACTER, not the path.
$appDir = @($appDirs)[0]

# Newest version folder = the one Vivaldi actually runs.
$versionDir = Get-ChildItem $appDir -Directory |
    Where-Object { $_.Name -match '^\d+(\.\d+)+$' } |
    Sort-Object { [version]$_.Name } |
    Select-Object -Last 1
if (-not $versionDir) { throw "No version folder found under $appDir." }

$uiDir = Join-Path $versionDir.FullName "resources\vivaldi"
$windowHtml = Join-Path $uiDir "window.html"
if (-not (Test-Path $windowHtml)) { throw "window.html not found at $windowHtml." }

# 1. Copy the mods into the UI folder (relative src is more reliable than file:///).
foreach ($mod in $modFiles) {
    Copy-Item (Join-Path $PSScriptRoot $mod) (Join-Path $uiDir $mod) -Force
    Write-Host "Copied $mod -> $uiDir"
}

# 2. Patch window.html (skip scripts already referenced).
$html = [System.IO.File]::ReadAllText($windowHtml)
$tags = ""
foreach ($mod in $modFiles) {
    if ($html -match [regex]::Escape($mod)) {
        Write-Host "window.html already references $mod - nothing to patch."
    } else {
        $tags += "  <script src=`"$mod`"></script>`r`n"
    }
}
if ($tags -ne "") {
    $patched = $html -replace '</body>', ($tags + "</body>")
    if ($patched -eq $html) { throw "Could not find </body> in window.html." }
    [System.IO.File]::WriteAllText($windowHtml, $patched)
    Write-Host "Patched $windowHtml"
}

Write-Host ""
Write-Host "Done (Vivaldi $($versionDir.Name)). Fully quit Vivaldi (Exit from the"
Write-Host "V-menu / tray, not just closing the window) and reopen for it to load."
