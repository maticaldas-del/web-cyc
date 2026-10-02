# Muestra las filas de Nissei (código, US$, nombre, link, foto) de los índices de scan (los que arma q-build.ps1).
# Uso: & nrow.ps1 -Ids 10066,11027
param([int[]]$Ids)
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
$bases = @{}
Get-Content (Join-Path $dir 'q-bases.txt') | Where-Object { $_ -match '=' } | ForEach-Object { $k, $v = $_.Split('='); $bases[[int]$k] = $v }
$cache = @{}
foreach ($id in $Ids) {
  $b = [int]([Math]::Floor($id / 1000) * 1000); if ($id -ge 200 -and $id -lt 1000) { $b = 200 }
  $slug = $bases[$b]
  if (-not $slug) { "$id | sin base"; continue }
  if (-not $cache[$slug]) { $cache[$slug] = Get-Content (Join-Path $dir "modelos-$slug.json") -Raw -Encoding UTF8 | ConvertFrom-Json }
  $g = $cache[$slug] | Where-Object { $_.i -eq ($id - $b) }
  foreach ($it in $g.items) {
    $n = $it.n
    if ($n -match [char]0xC3) { $n = [Text.Encoding]::UTF8.GetString([Text.Encoding]::GetEncoding(28591).GetBytes($n)) }
    "$id | $($it.cod) | $($it.p) | $n | $($it.h) | $($it.img.Split('/')[-1])"
  }
}
