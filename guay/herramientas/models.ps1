# Agrupa una categoría bajada por nissei-harvest.ps1 en modelos (junta colores) y arma la consulta para ML.
# Uso: powershell -File models.ps1 -Slug auricularheadset [-Max 250] [-Min 5]
# Salida: guay-datos\modelos-<slug>.json  y  un array JS [[consulta, usdMin, cantidad, idx], ...] para pegar en la pestaña de ML.
param([string]$Slug, [double]$Max = 250, [double]$Min = 4)
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
$items = Get-Content (Join-Path $dir "nissei-$Slug.json") -Raw -Encoding UTF8 | ConvertFrom-Json
# Códigos que ya están en el panel (candidatos + fichas). Se actualiza a mano desde el panel.
$known = @{}
$kf = Join-Path $dir 'codigos-panel.txt'
if (Test-Path $kf) { (Get-Content $kf -Raw) -split '[,\s]+' | Where-Object { $_ } | ForEach-Object { $known[$_.TrimStart('0')] = 1 } }
$drop = 'Fones? de Ouvido|Fones? Ouvido|Fones?|Auriculares?|Speaker|Port.til|Alto-Falante|Alto Falante|Caixa de Som|Rel.gio|Smartwatch|Smartband|Pulseira|Teclado|Mouse|Gamer|Gaming|Sem Fio|Com Fio|USB-C|Wi-Fi|Wifi|Headset|Headphone|Gamer|Sem Fio|Com Fio|Bluetooth|Bluethooth|Wireless|TWS|Microfone|In-Ear|Over-Ear|On-Ear|Esportivo|Garrafa|T.rmica|Botella|Termica|Rel.gio|Smartwatch|Teclado|Mouse|Caixa de Som|Parlante|Cabo|Carregador|Secador de Cabelo|Controle|Joystick|Perfume|Feminino|Masculino|Unissex|com|para|de|e|do|da'
$ok = $items | Where-Object { $_.p -le $Max -and $_.p -ge $Min -and -not $known[$_.cod.TrimStart('0')] }
$groups = $ok | Group-Object { ($_.n -replace '\s+-\s+[^-]+?(\s+\d+(\.\d+)?\s*(ML|L|GB|TB|MM))?$', '$1').Trim() }
$out = @(); $k = 0
foreach ($g in $groups) {
  $q = ($g.Name -replace "\b($drop)\b", ' ' -replace '[\(\)/,+]', ' ' -replace '\s+', ' ').Trim()
  if ($q.Length -lt 3) { $q = $g.Name }
  $minp = ($g.Group | Measure-Object p -Minimum).Minimum
  $out += [ordered]@{ i = $k; q = $q; nombre = $g.Name; usd = $minp; n = $g.Count; items = @($g.Group) }
  $k++
}
($out | ConvertTo-Json -Depth 5 -Compress) | Set-Content (Join-Path $dir "modelos-$Slug.json") -Encoding UTF8
"// $Slug : $($items.Count) items, $($ok.Count) filtrados, $($out.Count) modelos"
'[' + (($out | ForEach-Object { '["' + ($_.q -replace '"', '') + '",' + $_.usd + ',' + $_.n + ',' + $_.i + ']' }) -join ',') + ']'
