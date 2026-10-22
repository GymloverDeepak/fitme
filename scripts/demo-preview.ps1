# Renders the JSON from scripts/demo-preview.mjs into a contact-sheet PNG.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\demo-preview.ps1 <input.json> <output.png> [columns]
param([string]$InputJson, [string]$OutputPng, [int]$Columns = 6)
Add-Type -AssemblyName System.Drawing

$items = Get-Content $InputJson -Raw | ConvertFrom-Json
$cell = 220
$labelHeight = 34
$rows = [Math]::Ceiling($items.Count / $Columns)
$bitmap = New-Object System.Drawing.Bitmap ($Columns * $cell), ($rows * ($cell + $labelHeight))
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::FromArgb(255, 10, 10, 10))

$palette = @{
  figure    = [System.Drawing.Color]::FromArgb(255, 183, 255, 0)
  far       = [System.Drawing.Color]::FromArgb(150, 183, 255, 0)
  ghost     = [System.Drawing.Color]::FromArgb(80, 255, 255, 255)
  equip     = [System.Drawing.Color]::FromArgb(255, 200, 200, 200)
  equipDark = [System.Drawing.Color]::FromArgb(255, 95, 95, 95)
  arrow     = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
}
$font = New-Object System.Drawing.Font 'Segoe UI', 9
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

for ($i = 0; $i -lt $items.Count; $i++) {
  $item = $items[$i]
  $ox = ($i % $Columns) * $cell
  $oy = [Math]::Floor($i / $Columns) * ($cell + $labelHeight)
  $s = ($cell - 20) / 100.0
  $px = { param($p) @(($ox + 10 + $p[0] * $s), ($oy + 10 + $p[1] * $s)) }
  $g.DrawRectangle((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 41, 41, 41))), $ox + 2, $oy + 2, $cell - 4, $cell - 4)
  foreach ($prim in $item.primitives) {
    $color = $palette[$prim.color]
    if ($prim.kind -eq 'line') {
      $a = & $px $prim.a; $b = & $px $prim.b
      $pen = New-Object System.Drawing.Pen $color, ([single]($prim.width * $s))
      $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
      $g.DrawLine($pen, [single]$a[0], [single]$a[1], [single]$b[0], [single]$b[1])
      $pen.Dispose()
    } else {
      $c = & $px $prim.c; $r = $prim.r * $s
      if ($prim.fill -ne $false) {
        $brush = New-Object System.Drawing.SolidBrush $color
        $g.FillEllipse($brush, [single]($c[0] - $r), [single]($c[1] - $r), [single]($r * 2), [single]($r * 2)); $brush.Dispose()
      } else {
        $pen = New-Object System.Drawing.Pen $color, ([single]($prim.width * $s))
        $g.DrawEllipse($pen, [single]($c[0] - $r), [single]($c[1] - $r), [single]($r * 2), [single]($r * 2)); $pen.Dispose()
      }
    }
  }
  $label = if ($item.primitives.Count -eq 0) { "NO DEMO: $($item.name)" } else { $item.name }
  $g.DrawString($label, $font, $white, (New-Object System.Drawing.RectangleF ($ox + 4), ($oy + $cell), ($cell - 8), $labelHeight))
}
$bitmap.Save($OutputPng, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bitmap.Dispose()
Write-Output "Saved $OutputPng"
