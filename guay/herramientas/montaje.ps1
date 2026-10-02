# Arma UNA imagen con pares de fotos (Nissei | ML) para compararlas de un vistazo.
# Uso: powershell -File montaje.ps1 -Pares "etiqueta|urlNissei|urlML;etiqueta2|..." -Salida C:\ruta\montaje.png
param([string]$Pares, [string]$Salida)
Add-Type -AssemblyName PresentationCore, WindowsBase, System.Drawing
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36'
function Cargar($url) {
  $bytes = (Invoke-WebRequest -UseBasicParsing -UserAgent $ua $url -TimeoutSec 60).Content
  $ms = New-Object System.IO.MemoryStream(,$bytes)
  $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($ms, 'PreservePixelFormat', 'OnLoad')
  $frame = $dec.Frames[0]
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frame))
  $out = New-Object System.IO.MemoryStream
  $enc.Save($out); $out.Position = 0
  return [System.Drawing.Image]::FromStream($out)
}
$lista = $Pares -split ';' | Where-Object { $_ }
$celda = 180; $alto = 200
$bmp = New-Object System.Drawing.Bitmap ($celda * 2 + 20), ($alto * $lista.Count)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font('Arial', 9, [System.Drawing.FontStyle]::Bold)
$i = 0
foreach ($p in $lista) {
  $f = $p -split '\|'
  $y = $i * $alto
  $g.DrawString($f[0], $font, [System.Drawing.Brushes]::Black, 2, $y + 2)
  for ($k = 1; $k -le 2; $k++) {
    try {
      $img = Cargar $f[$k]
      $esc = [Math]::Min(($celda - 10) / $img.Width, ($alto - 25) / $img.Height)
      $w = [int]($img.Width * $esc); $h = [int]($img.Height * $esc)
      $g.DrawImage($img, (($k - 1) * ($celda + 20)) + 5, $y + 20, $w, $h); $img.Dispose()
    } catch { $g.DrawString('ERR', $font, [System.Drawing.Brushes]::Red, (($k - 1) * ($celda + 20)) + 5, $y + 60) }
  }
  $g.DrawLine([System.Drawing.Pens]::Gray, 0, $y + $alto - 1, $bmp.Width, $y + $alto - 1)
  $i++
}
$bmp.Save($Salida, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
"montaje: $($lista.Count) pares -> $Salida"
