# Cuenta cuántas filas de Nissei tiene cada categoría de comprasparaguay (sitemap-categorias.xml), en 8 trabajos paralelos.
# Antes: bajar https://comprasparaguay.com.ar/sitemap-categorias.xml y guardar los slugs en guay-datos\categorias-sitemap.txt
# Salida: guay-datos\categorias-nissei.csv (slug;paginas;filasPag1x3) ordenado por tamaño.
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
$slugs = Get-Content (Join-Path $dir 'categorias-sitemap.txt') | Where-Object { $_ -and $_ -notmatch '/' }
$n = 8; $jobs = @()
for ($k = 0; $k -lt $n; $k++) {
  $part = @($slugs | Where-Object { ([array]::IndexOf($slugs, $_) % $n) -eq $k })
  $jobs += Start-Job -ArgumentList (, $part) -ScriptBlock {
    param($part)
    $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
    foreach ($s in $part) {
      $c = ''
      for ($t = 0; $t -lt 3 -and -not $c; $t++) { try { $c = (Invoke-WebRequest -UseBasicParsing -UserAgent $ua "https://comprasparaguay.com.ar/$s/?loja=nissei" -TimeoutSec 60).Content } catch { Start-Sleep 2 } }
      $items = ([regex]::Matches($c, "'advertiser': 'Nissei'")).Count
      $nums = [regex]::Matches($c, 'page=(\d+)&') | ForEach-Object { [int]$_.Groups[1].Value }
      $last = if ($nums) { ($nums | Measure-Object -Maximum).Maximum } else { 1 }
      "$s;$last;$items"
    }
  }
}
$res = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
$res | Sort-Object { - [int]($_.Split(';')[1]) * 100 - [int]($_.Split(';')[2]) } | Set-Content (Join-Path $dir 'categorias-nissei.csv') -Encoding UTF8
"listo: $($res.Count) categorias, con Nissei: $(@($res | Where-Object { [int]$_.Split(';')[2] -gt 0 }).Count)"
