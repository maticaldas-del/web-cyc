# Sirve guay-datos en http://127.0.0.1:8765/ con CORS, para que las pestañas de listado.mercadolibre.com.ar
# lean las listas y guarden resultados (POST) sin pegarlos a mano. (www.mercadolibre.com.ar NO puede: CSP.)
# OJO: Chrome nuevo pide permiso de 'red local' a listado.mercadolibre.com.ar la primera vez.
# Uso: & serve.ps1   (queda corriendo)
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) 'guay-datos'
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add('http://127.0.0.1:8765/')
$l.IgnoreWriteExceptions = $true
$l.Start()
while ($l.IsListening) {
  try {
    $c = $l.GetContext()
    $r = $c.Response
    $r.Headers.Add('Access-Control-Allow-Origin', '*')
    $r.Headers.Add('Access-Control-Allow-Private-Network', 'true')
    $r.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    $r.Headers.Add('Access-Control-Allow-Headers', '*')
    if ($c.Request.HttpMethod -eq 'OPTIONS') { $r.StatusCode = 204; $r.Close(); continue }
    $name = Split-Path ([Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))) -Leaf
    if ($c.Request.HttpMethod -eq 'POST') {
      $sr = New-Object System.IO.StreamReader($c.Request.InputStream, [Text.Encoding]::UTF8)
      [IO.File]::WriteAllText((Join-Path $dir $name), $sr.ReadToEnd(), [Text.UTF8Encoding]::new($false))
      $b = [Text.Encoding]::UTF8.GetBytes('ok')
    } else {
      $p = Join-Path $dir $name
      if ($name -and (Test-Path $p)) { $b = [IO.File]::ReadAllBytes($p); $r.ContentType = 'text/plain; charset=utf-8' } else { $r.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes('no') }
    }
    $r.OutputStream.Write($b, 0, $b.Length)
    $r.Close()
  } catch { try { $r.Abort() } catch {} }
}
