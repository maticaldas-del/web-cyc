# Saca de res-<key>.json (resultado de una tanda de scan) los que pasaron el filtro, como array JS corto
# [[índice, catálogo, usd], ...] para pegar en la pestaña de catálogo de ML (verif).
# Uso: & hits.ps1 -Keys t3,t4a
param([string[]]$Keys)
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
$o = @()
foreach ($k in $Keys) {
  $r = Get-Content (Join-Path $dir "res-$k.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($l in ($r.out -split "`n")) {
    if ($l -match '^(\d+) .*? \$([\d.]+) -> (MLA\d+) ') { $o += "[$($Matches[1]),'$($Matches[3])',$($Matches[2])]" }
  }
}
"// $($o.Count) hits"
'[' + ($o -join ',') + ']'
