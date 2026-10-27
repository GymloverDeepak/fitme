# Prepares website images from the FITME app's real assets and real device screenshots.
# Usage (from fitme-website): powershell -NoProfile -File scripts\prepare-images.ps1 <screenshotFolder>
param([string]$ScreenshotFolder)
Add-Type -AssemblyName System.Drawing

$site = Split-Path $PSScriptRoot -Parent
$app = Split-Path $site -Parent
$public = Join-Path $site 'public'
$shots = Join-Path $public 'screenshots'
New-Item -ItemType Directory -Force $public, $shots | Out-Null

function Save-Jpeg($bitmap, $path, [int]$quality = 82) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $bitmap.Save($path, $codec, $params)
}

function Resize($sourcePath, [int]$width) {
  $src = [System.Drawing.Image]::FromFile($sourcePath)
  $height = [int]($src.Height * $width / $src.Width)
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($src, 0, 0, $width, $height)
  $g.Dispose(); $src.Dispose()
  return $bmp
}

# Logo and icons come straight from the app (no redrawing).
Copy-Item (Join-Path $app 'assets\images\gymlover-deepak-logo.png') (Join-Path $public 'logo.png') -Force
$icon = Resize (Join-Path $app 'assets\icon.png') 180; $icon.Save((Join-Path $public 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png); $icon.Dispose()
$fav = Resize (Join-Path $app 'assets\icon.png') 64; $fav.Save((Join-Path $public 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png); $fav.Dispose()

# Open Graph image (1200x630): app icon + FITME wordmark on midnight navy (Midnight Titanium theme).
$og = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'; $g.InterpolationMode = 'HighQualityBicubic'
$g.Clear([System.Drawing.Color]::FromArgb(255, 8, 13, 24))
$appIcon = [System.Drawing.Image]::FromFile((Join-Path $app 'assets\icon.png'))
$g.DrawImage($appIcon, 80, 115, 400, 400); $appIcon.Dispose()
$accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 66, 184, 255))
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 244, 247, 252))
$grey = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 170, 183, 202))
$tight = [System.Drawing.StringFormat]::GenericTypographic
$big = New-Object System.Drawing.Font 'Arial Black', 120, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$fitWidth = $g.MeasureString('FIT', $big, 2000, $tight).Width
$g.DrawString('FIT', $big, $white, 540, 150, $tight)
$g.DrawString('ME', $big, $accent, (540 + $fitWidth), 150, $tight)
$mid = New-Object System.Drawing.Font 'Segoe UI', 40, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$small = New-Object System.Drawing.Font 'Segoe UI', 30, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('YOUR FITNESS. YOUR RULES.', $mid, $accent, 545, 320)
$g.DrawString('Offline Android fitness app', $small, $white, 545, 390)
$g.DrawString('by Gymlover Deepak', $small, $grey, 545, 435)
$g.Dispose()
Save-Jpeg $og (Join-Path $public 'og-image.jpg') 88
$og.Dispose()

# Real screenshots from the FITME app running on a Galaxy Z Fold6 (cover screen).
if ($ScreenshotFolder) {
  # v1.1.1 screenshots (Midnight Titanium theme).
  $map = [ordered]@{
    'home.jpg'              = 'home.png'
    'workout-planner.jpg'   = 'training-filter.png'
    'training-styles.jpg'   = 'hyrox-plans.png'
    'exercise-library.jpg'  = 'library.jpg'
    'exercise-demo.jpg'     = 'demos.jpg'
    'deadlift-session.jpg'  = 'deadlift-session.jpg'
    'bmi-calculator.jpg'    = 'bmi.png'
  }
  foreach ($name in $map.Keys) {
    $source = Join-Path $ScreenshotFolder $map[$name]
    if (-not (Test-Path $source)) { Write-Output "MISSING screenshot: $source"; continue }
    $bmp = Resize $source 540
    Save-Jpeg $bmp (Join-Path $shots $name) 80
    $bmp.Dispose()
  }
}
Get-ChildItem $public -Recurse -File | ForEach-Object { "{0,-28} {1,6} KB" -f $_.FullName.Substring($public.Length + 1), [math]::Round($_.Length / 1KB) }
