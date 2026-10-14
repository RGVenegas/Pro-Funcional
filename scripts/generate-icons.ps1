Add-Type -AssemblyName System.Drawing

function Resize-Image($srcPath, $destPath, $width, $height) {
    $img = [System.Drawing.Bitmap]::FromFile($srcPath)
    $canvas = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $bgColor = [System.Drawing.Color]::FromArgb(255, 1, 10, 1)
    $graphics.Clear($bgColor)
    $graphics.DrawImage($img, 0, 0, $width, $height)
    $canvas.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $canvas.Dispose()
    $img.Dispose()
    Write-Host "Generated: $destPath ($width x $height)"
}

$root = Get-Location
$logoPath = Join-Path $root "public\logo.png"

Resize-Image $logoPath (Join-Path $root "public\icon-192.png") 192 192
Resize-Image $logoPath (Join-Path $root "public\icon-512.png") 512 512
Resize-Image $logoPath (Join-Path $root "public\apple-touch-icon.png") 180 180
Resize-Image $logoPath (Join-Path $root "public\favicon.png") 64 64
