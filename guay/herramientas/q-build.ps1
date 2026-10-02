# Arma la lista de consultas para ML (scanBg) de varias categorías ya bajadas con nissei-harvest.ps1.
# Uso: & q-build.ps1 -Slugs disco-duro-ssd,tarjeta-de-memoria -Base 1000
# Índice de cada modelo = Base + 1000*posición del slug + índice en modelos-<slug>.json (para encontrarlo después).
param([string[]]$Slugs, [int]$Base = 0, [string]$Out)
$tools = $PSScriptRoot
$dir = Join-Path (Split-Path $tools -Parent) 'guay-datos'
$o = @(); $k = 0
foreach ($s in $Slugs) {
  & (Join-Path $tools 'models.ps1') -Slug $s | Select-Object -First 1
  $m = Get-Content (Join-Path $dir "modelos-$s.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($x in $m) {
    $q = $x.q
    if ($q -match [char]0xC3) { $q = [Text.Encoding]::UTF8.GetString([Text.Encoding]::GetEncoding(28591).GetBytes($q)) }  # el harvest baja en latin-1
    $q = ($q -replace '\s+-\s+.*$', '' -replace '\b(USB-A|USB|Bivolt|Eu|Ue|Gan|Rápido|Preto|Branco|Black|White)\b', ' ' -replace '[–"]', ' ' -replace '\s+', ' ').Trim()
    $o += '["' + $q + '",' + $x.usd + ',' + $x.n + ',' + ($Base + 1000 * $k + $x.i) + ']'
  }
  $k++
}
$js = '[' + ($o -join ',') + ']'
$name = if ($Out) { $Out } else { 'q-' + ($Slugs -join '+') + '.txt' }
[System.IO.File]::WriteAllText((Join-Path $dir $name), $js, [System.Text.UTF8Encoding]::new($false))
"$($o.Count) consultas -> $name"
