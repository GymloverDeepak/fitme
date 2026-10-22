# Builds FITME's app icon, Android adaptive icon layers, splash image and favicon from the
# Gym Lover Deepak logo (assets/images/gymlover-deepak-logo.png).
# The logo is black artwork on transparency, so it is placed - unchanged, only scaled
# proportionally - on a white badge with a neon-green ring, which keeps it visible on black.
# Run from the project root in Windows PowerShell:
#   powershell -ExecutionPolicy Bypass -File scripts\generate-assets.ps1
Add-Type -AssemblyName System.Drawing

$assets = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
$logoPath = Join-Path $assets 'images\gymlover-deepak-logo.png'
if (-not (Test-Path $logoPath)) { throw "Logo not found at $logoPath" }
$logo = [System.Drawing.Image]::FromFile($logoPath)

$neon = [System.Drawing.Color]::FromArgb(255, 0xB7, 0xFF, 0x00)
$black = [System.Drawing.Color]::FromArgb(255, 0x0A, 0x0A, 0x0A)
$white = [System.Drawing.Color]::White

function New-Canvas([int]$size, $background) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($background) { $graphics.Clear($background) } else { $graphics.Clear([System.Drawing.Color]::Transparent) }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

# Draws the logo centred at (cx, cy), scaled to fit a box of `size`, keeping its aspect ratio.
function Draw-Logo($graphics, [double]$size, [double]$cx, [double]$cy) {
  $ratio = [Math]::Min($size / $logo.Width, $size / $logo.Height)
  $w = $logo.Width * $ratio
  $h = $logo.Height * $ratio
  $graphics.DrawImage($logo, [single]($cx - $w / 2), [single]($cy - $h / 2), [single]$w, [single]$h)
}

# White circle + neon ring + logo inside.
function Draw-Badge($graphics, [double]$diameter, [double]$cx, [double]$cy) {
  $ring = [Math]::Max(1, $diameter * 0.022)
  $neonBrush = New-Object System.Drawing.SolidBrush $neon
  $whiteBrush = New-Object System.Drawing.SolidBrush $white
  $graphics.FillEllipse($neonBrush, [single]($cx - $diameter / 2), [single]($cy - $diameter / 2), [single]$diameter, [single]$diameter)
  $inner = $diameter - 2 * $ring
  $graphics.FillEllipse($whiteBrush, [single]($cx - $inner / 2), [single]($cy - $inner / 2), [single]$inner, [single]$inner)
  Draw-Logo $graphics ($inner * 0.80) $cx $cy
  $neonBrush.Dispose()
  $whiteBrush.Dispose()
}

function Save-Canvas($canvas, [string]$name) {
  $path = Join-Path $assets $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
  Write-Output "Created $path"
}

# 1. Main icon (1024, black background)
$c = New-Canvas 1024 $black
Draw-Badge $c.Graphics 900 512 512
Save-Canvas $c 'icon.png'

# 2. Adaptive icon foreground: badge kept inside Android's central safe zone (66% of the canvas)
$c = New-Canvas 1024 $null
Draw-Badge $c.Graphics 660 512 512
Save-Canvas $c 'android-icon-foreground.png'

# 3. Adaptive icon background (solid black)
$c = New-Canvas 1024 $black
Save-Canvas $c 'android-icon-background.png'

# 4. Monochrome layer for Android 13+ themed icons. Android uses only its shape (alpha),
#    so the logo's own transparent silhouette is used, scaled to the safe zone.
$c = New-Canvas 1024 $null
Draw-Logo $c.Graphics 600 512 512
Save-Canvas $c 'android-icon-monochrome.png'

# 5. Splash image (transparent; shown centred on #0A0A0A)
$c = New-Canvas 1024 $null
Draw-Badge $c.Graphics 1000 512 512
Save-Canvas $c 'splash-icon.png'

# 6. Favicon (48, web preview only)
$c = New-Canvas 48 $black
Draw-Badge $c.Graphics 46 24 24
Save-Canvas $c 'favicon.png'

$logo.Dispose()
