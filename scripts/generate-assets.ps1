# Builds FITME's app icon, Android adaptive icon layers, splash image and favicon from the
# Gym Lover Deepak logo (assets/images/gymlover-deepak-logo.png).
# The logo is black artwork on transparency, so it is placed - unchanged, only scaled
# proportionally - on a white badge with a titanium and electric-blue ring (Midnight Titanium
# theme), which keeps it visible on the midnight-navy background.
# The launcher icons add the FITME wordmark under the badge ("FIT" titanium white, "ME" electric
# blue, as in the app). Badge and wordmark are sized to stay inside Android's adaptive-icon safe
# zone, so no launcher mask (circle, squircle, rounded square) can crop them.
# Run from the project root in Windows PowerShell:
#   powershell -NoProfile -File scripts\generate-assets.ps1             (all assets)
#   powershell -NoProfile -File scripts\generate-assets.ps1 -IconsOnly  (launcher icons only)
param([switch]$IconsOnly)

Add-Type -AssemblyName System.Drawing

$assets = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
$logoPath = Join-Path $assets 'images\gymlover-deepak-logo.png'
if (-not (Test-Path $logoPath)) { throw "Logo not found at $logoPath" }
$logo = [System.Drawing.Image]::FromFile($logoPath)

# Keep in sync with src/theme/colors.js.
$accent = [System.Drawing.Color]::FromArgb(255, 0x42, 0xB8, 0xFF)
$midnight = [System.Drawing.Color]::FromArgb(255, 0x08, 0x0D, 0x18)
$surfaceElevated = [System.Drawing.Color]::FromArgb(255, 0x20, 0x2D, 0x42)
$titanium = [System.Drawing.Color]::FromArgb(255, 0xAA, 0xB7, 0xCA)
$textPrimary = [System.Drawing.Color]::FromArgb(255, 0xF4, 0xF7, 0xFC)
$white = [System.Drawing.Color]::White

$wordmarkFont = New-Object System.Drawing.FontFamily 'Segoe UI Black'

function New-Canvas([int]$size, $background) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($background) { $graphics.Clear($background) } else { $graphics.Clear([System.Drawing.Color]::Transparent) }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

# Midnight navy with a soft, lighter centre - depth without visible gradients at launcher size.
function Fill-MidnightBackground($graphics, [int]$size) {
  $graphics.Clear($midnight)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse([single](-$size * 0.25), [single](-$size * 0.25), [single]($size * 1.5), [single]($size * 1.5))
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
  $brush.CenterColor = $surfaceElevated
  $brush.SurroundColors = [System.Drawing.Color[]]@($midnight)
  $graphics.FillRectangle($brush, 0, 0, $size, $size)
  $brush.Dispose()
  $path.Dispose()
}

# Draws the logo centred at (cx, cy), scaled to fit a box of `size`, keeping its aspect ratio.
function Draw-Logo($graphics, [double]$size, [double]$cx, [double]$cy) {
  $ratio = [Math]::Min($size / $logo.Width, $size / $logo.Height)
  $w = $logo.Width * $ratio
  $h = $logo.Height * $ratio
  $graphics.DrawImage($logo, [single]($cx - $w / 2), [single]($cy - $h / 2), [single]$w, [single]$h)
}

# White circle + titanium hairline + accent ring + logo inside.
function Draw-Badge($graphics, [double]$diameter, [double]$cx, [double]$cy) {
  $titaniumRing = [Math]::Max(1, $diameter * 0.012)
  $accentRing = [Math]::Max(1, $diameter * 0.026)
  $titaniumBrush = New-Object System.Drawing.SolidBrush $titanium
  $accentBrush = New-Object System.Drawing.SolidBrush $accent
  $whiteBrush = New-Object System.Drawing.SolidBrush $white
  $d = $diameter
  $graphics.FillEllipse($titaniumBrush, [single]($cx - $d / 2), [single]($cy - $d / 2), [single]$d, [single]$d)
  $d = $d - 2 * $titaniumRing
  $graphics.FillEllipse($accentBrush, [single]($cx - $d / 2), [single]($cy - $d / 2), [single]$d, [single]$d)
  $d = $d - 2 * $accentRing
  $graphics.FillEllipse($whiteBrush, [single]($cx - $d / 2), [single]($cy - $d / 2), [single]$d, [single]$d)
  Draw-Logo $graphics ($d * 0.80) $cx $cy
  $titaniumBrush.Dispose()
  $accentBrush.Dispose()
  $whiteBrush.Dispose()
}

# Builds one glyph outline per letter, laid out left to right with a little tracking.
# Returns the paths and the overall glyph bounds at the font's natural size.
function New-WordmarkPaths([double]$emSize) {
  $letters = @(
    @{ Text = 'F'; Accent = $false }, @{ Text = 'I'; Accent = $false }, @{ Text = 'T'; Accent = $false },
    @{ Text = 'M'; Accent = $true }, @{ Text = 'E'; Accent = $true }
  )
  $format = [System.Drawing.StringFormat]::GenericTypographic
  $tracking = $emSize * 0.04
  $x = 0.0
  $result = @()
  foreach ($letter in $letters) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddString($letter.Text, $wordmarkFont, 0, [single]$emSize, (New-Object System.Drawing.PointF 0, 0), $format)
    $b = $path.GetBounds()
    $shift = New-Object System.Drawing.Drawing2D.Matrix
    $shift.Translate([single]($x - $b.X), 0)
    $path.Transform($shift)
    $shift.Dispose()
    $result += @{ Path = $path; Accent = $letter.Accent }
    $x += $b.Width + $tracking
  }
  $union = New-Object System.Drawing.Drawing2D.GraphicsPath
  foreach ($item in $result) { $union.AddPath($item.Path, $false) }
  $bounds = $union.GetBounds()
  $union.Dispose()
  return @{ Letters = $result; Bounds = $bounds }
}

# Draws "FITME" so its glyphs exactly fill the box (left, top, width, height).
# monochrome = $true draws every letter white (only the shape matters for themed icons).
function Draw-Wordmark($graphics, [double]$left, [double]$top, [double]$width, [double]$height, [bool]$monochrome) {
  $mark = New-WordmarkPaths 200
  $scale = [Math]::Min($width / $mark.Bounds.Width, $height / $mark.Bounds.Height)
  $drawnWidth = $mark.Bounds.Width * $scale
  $matrix = New-Object System.Drawing.Drawing2D.Matrix
  $matrix.Translate([single]($left + ($width - $drawnWidth) / 2), [single]$top)
  $matrix.Scale([single]$scale, [single]$scale)
  $matrix.Translate([single](-$mark.Bounds.X), [single](-$mark.Bounds.Y))
  $lightBrush = New-Object System.Drawing.SolidBrush $(if ($monochrome) { $white } else { $textPrimary })
  $accentBrush = New-Object System.Drawing.SolidBrush $(if ($monochrome) { $white } else { $accent })
  foreach ($item in $mark.Letters) {
    $item.Path.Transform($matrix)
    $graphics.FillPath($(if ($item.Accent) { $accentBrush } else { $lightBrush }), $item.Path)
    $item.Path.Dispose()
  }
  $matrix.Dispose()
  $lightBrush.Dispose()
  $accentBrush.Dispose()
}

# Badge above, wordmark below, both inside a circle of radius r centred at (cx, cy).
# The wordmark is as large as the circle allows at its position (checked at its bottom corners).
function Draw-IconComposition($graphics, [double]$r, [double]$cx, [double]$cy, [bool]$monochrome) {
  $badgeRadius = 0.56 * $r
  $gap = 0.07 * $r
  $mark = New-WordmarkPaths 200
  $aspect = $mark.Bounds.Width / $mark.Bounds.Height
  foreach ($path in $mark.Letters) { $path.Path.Dispose() }

  # Largest wordmark height h such that the stack (badge + gap + h) is centred and the
  # wordmark's bottom corners sit inside the circle with a small margin.
  $h = 0.40 * $r
  while ($h -gt 0.1 * $r) {
    $half = ($badgeRadius * 2 + $gap + $h) / 2
    $bottom = $half
    $allowedHalfWidth = [Math]::Sqrt([Math]::Max(0, (0.97 * $r) * (0.97 * $r) - $bottom * $bottom))
    if (($h * $aspect) / 2 -le $allowedHalfWidth) { break }
    $h -= 0.005 * $r
  }
  $half = ($badgeRadius * 2 + $gap + $h) / 2
  $badgeCy = $cy - $half + $badgeRadius
  $textTop = $cy - $half + 2 * $badgeRadius + $gap

  if ($monochrome) {
    Draw-Logo $graphics ($badgeRadius * 2 * 0.95) $cx $badgeCy
  } else {
    Draw-Badge $graphics ($badgeRadius * 2) $cx $badgeCy
  }
  Draw-Wordmark $graphics ($cx - $h * $aspect / 2) $textTop ($h * $aspect) $h $monochrome
}

function Save-Canvas($canvas, [string]$name) {
  $path = Join-Path $assets $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
  Write-Output "Created $path"
}

# Android adaptive icons are 108 dp; launchers may mask everything outside the central 66 dp.
# On a 1024 px canvas that safe zone is a circle of radius 1024 * 33 / 108 = 312.9 px.
$safeRadius = 1024 * 33 / 108

# 1. Main icon (1024, full square - legacy launchers and the base for generated mipmaps)
$c = New-Canvas 1024 $null
Fill-MidnightBackground $c.Graphics 1024
Draw-IconComposition $c.Graphics 430 512 512 $false
Save-Canvas $c 'icon.png'

# 2. Adaptive icon foreground: badge + wordmark inside the safe zone, transparent elsewhere
$c = New-Canvas 1024 $null
Draw-IconComposition $c.Graphics $safeRadius 512 512 $false
Save-Canvas $c 'android-icon-foreground.png'

# 3. Adaptive icon background (midnight navy, soft lighter centre)
$c = New-Canvas 1024 $null
Fill-MidnightBackground $c.Graphics 1024
Save-Canvas $c 'android-icon-background.png'

# 4. Monochrome layer for Android 13+ themed icons. Android uses only its shape (alpha),
#    so the logo's own silhouette and the wordmark are used, in the same safe-zone layout.
$c = New-Canvas 1024 $null
Draw-IconComposition $c.Graphics $safeRadius 512 512 $true
Save-Canvas $c 'android-icon-monochrome.png'

if (-not $IconsOnly) {
  # 5. Splash image (transparent; shown centred on #080D18)
  $c = New-Canvas 1024 $null
  Draw-Badge $c.Graphics 1000 512 512
  Save-Canvas $c 'splash-icon.png'

  # 6. Favicon (48, web preview only)
  $c = New-Canvas 48 $midnight
  Draw-Badge $c.Graphics 46 24 24
  Save-Canvas $c 'favicon.png'
}

$wordmarkFont.Dispose()
$logo.Dispose()
