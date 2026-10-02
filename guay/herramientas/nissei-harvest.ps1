# Baja TODOS los productos de Nissei de comprasparaguay, por categoría, a guay-datos\nissei-<slug>.json
# Uso: powershell -File nissei-harvest.ps1 -Slugs termo,mouse    (sin -Slugs = todas las de la lista)
param([string[]]$Slugs)
$ErrorActionPreference = 'Continue'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
$base = 'https://comprasparaguay.com.ar'
$outDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
New-Item -ItemType Directory -Force $outDir | Out-Null
if (-not $Slugs) {
  $Slugs = @('auricularheadset','reloj','varios','teclado','mouse','caja-de-sonido','cables','cargador-de-pared','disco-duro-ssd','termo',
    'tarjeta-de-memoria','router-y-punto-de-acceso','secador-de-cabello','control-para-videojuegos','adaptador-conector','cargador-portatil',
    'anel-inteligente','microfono-inalambrico','funda-para-celular','juegos','equipos-para-iluminacion','cooler','memoria-ram','fuente',
    'filamento-para-impresora-3d','robot-de-limpieza','cafetera','flash','otros-accesorios-para-camara','cosmetico','labial','base',
    'shampu-y-acondicionador','perfume')
}
function Get-Page($url) {
  for ($t = 0; $t -lt 3; $t++) {
    try { return (Invoke-WebRequest -UseBasicParsing -UserAgent $ua $url -TimeoutSec 60).Content } catch { Start-Sleep -Seconds 3 }
  }
  return ''
}
function Clean($s) { if ($null -eq $s) { return '' }; return ([System.Net.WebUtility]::HtmlDecode($s) -replace '\s+', ' ').Trim() }
foreach ($slug in $Slugs) {
  $items = New-Object System.Collections.ArrayList
  $page = 1; $last = 1
  do {
    $c = Get-Page "$base/$slug/?page=$page&loja=nissei"
    if ($page -eq 1) {
      $nums = [regex]::Matches($c, 'page=(\d+)&') | ForEach-Object { [int]$_.Groups[1].Value }
      if ($nums) { $last = ($nums | Measure-Object -Maximum).Maximum }
    }
    $i = $c.IndexOf('resultados-busca')
    if ($i -ge 0) {
      $blocks = $c.Substring($i) -split 'promocao-produtos-item col-sm-12'
      foreach ($b in $blocks[1..($blocks.Count - 1)]) {
        if ($b -notmatch "'advertiser': 'Nissei'") { continue }
        $h = [regex]::Match($b, 'href="(/[^"]+__\d+/)"').Groups[1].Value
        if (-not $h) { continue }
        $n = Clean ([regex]::Match($b, 'title="([^"]+)"').Groups[1].Value)
        $cod = [regex]::Match($b, 'c.{1,2}digo:\s*<strong>([^<]+)</strong>').Groups[1].Value.Trim()
        $cat = Clean ([regex]::Match($b, "'category': '([^']*)'").Groups[1].Value)
        $img = [regex]::Match($b, 'data-src="([^"]+)"').Groups[1].Value
        $pm = [regex]::Match($b, 'US\$\s*([\d\.]+,\d\d)')
        $p = if ($pm.Success) { [double](($pm.Groups[1].Value -replace '\.', '') -replace ',', '.') } else { 0 }
        [void]$items.Add([ordered]@{ n = $n; cod = $cod; p = $p; cat = $cat; h = $h; img = $img })
      }
    }
    $page++
  } while ($page -le $last)
  $json = $items | ConvertTo-Json -Depth 3 -Compress
  [System.IO.File]::WriteAllText((Join-Path $outDir "nissei-$slug.json"), $json, [System.Text.UTF8Encoding]::new($false))
  Write-Output "$slug : $($items.Count) items ($last paginas)"
}
