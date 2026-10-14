Add-Type -AssemblyName System.Drawing

function Generate-Icon($srcPath, $destPath, $width, $height) {
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
    Write-Host "Updated: $destPath ($width x $height)"
}

$root = Get-Location
$logoPath = Join-Path $root "public\logo.png"
$resPath = Join-Path $root "android\app\src\main\res"

# Mipmap App Icons
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folder in $iconSizes.Keys) {
    $size = $iconSizes[$folder]
    $dir = Join-Path $resPath $folder
    if (Test-Path $dir) {
        Generate-Icon $logoPath (Join-Path $dir "ic_launcher.png") $size $size
        Generate-Icon $logoPath (Join-Path $dir "ic_launcher_round.png") $size $size
        Generate-Icon $logoPath (Join-Path $dir "ic_launcher_foreground.png") $size $size
    }
}

# Splash screens
$drawableSplash = Join-Path $resPath "drawable\splash.png"
Generate-Icon $logoPath $drawableSplash 480 800

Write-Host "Android assets updated successfully with official branding!"
