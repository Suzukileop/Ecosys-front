# Mode réseau local (téléphone / autre PC sur le même Wi‑Fi)
# Usage : depuis frontend/ →  npm run lan:setup
# Puis redémarrer frontend + backend.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$frontendEnv = Join-Path $root '.env.local'
$backendLocal = Join-Path (Split-Path $root -Parent) 'backend\src\main\resources\application-local.yml'

$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254.*' -and
    $_.PrefixOrigin -ne 'WellKnown'
  } |
  Sort-Object InterfaceMetric |
  Select-Object -First 1 -ExpandProperty IPAddress
)

if (-not $ip) {
  Write-Error 'Aucune IPv4 locale trouvée. Vérifiez votre connexion Ethernet/Wi‑Fi.'
}

Write-Host "IP locale détectée : $ip" -ForegroundColor Cyan

# --- Frontend .env.local ---
$frontendLine = "NEXT_PUBLIC_API_URL=http://${ip}:8080"
if (Test-Path $frontendEnv) {
  $content = Get-Content $frontendEnv -Raw
  if ($content -match '(?m)^NEXT_PUBLIC_API_URL=.*$') {
    $content = [regex]::Replace($content, '(?m)^NEXT_PUBLIC_API_URL=.*$', $frontendLine)
  } else {
    $content = $content.TrimEnd() + "`n$frontendLine`n"
  }
} else {
  $content = "$frontendLine`n"
}
Set-Content -Path $frontendEnv -Value $content.TrimEnd() -NoNewline -Encoding utf8
Write-Host "Frontend : $frontendEnv" -ForegroundColor Green
Write-Host "  $frontendLine"

# --- Backend application-local.yml (bloc app: URLs LAN) ---
if (-not (Test-Path $backendLocal)) {
  Write-Warning "Fichier introuvable : $backendLocal — configurez le backend manuellement."
} else {
  $yaml = Get-Content $backendLocal -Raw
  $lanBlock = @"
app:
  frontend-url: http://${ip}:3000
  backend-public-url: http://${ip}:8080
  storage:
    public-base-url: http://${ip}:8080
"@

  if ($yaml -match '(?ms)^app:\r?\n  frontend-url:') {
    $yaml = [regex]::Replace(
      $yaml,
      '(?ms)^app:\r?\n  frontend-url:.*?\r?\n  backend-public-url:.*?\r?\n  storage:\r?\n    public-base-url:.*?\r?\n',
      ($lanBlock + "`n")
    )
  } elseif ($yaml -match '(?ms)^app:\r?\n  oauth:') {
    $yaml = [regex]::Replace($yaml, '(?ms)^app:\r?\n  oauth:', ($lanBlock + "  oauth:"))
  } else {
    Write-Warning 'Bloc app: introuvable dans application-local.yml — ajoutez manuellement les URLs LAN.'
  }

  if ($yaml -notmatch 'frontend-url') {
    Write-Warning 'Impossible de mettre à jour application-local.yml automatiquement.'
  } else {
    Set-Content -Path $backendLocal -Value $yaml.TrimEnd() -NoNewline -Encoding utf8
    Write-Host "Backend : application-local.yml mis à jour" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host 'Prochaines étapes :' -ForegroundColor Yellow
Write-Host "  1. npm run dev:lan          (frontend accessible sur http://${ip}:3000)"
Write-Host '  2. Redémarrer le backend Spring Boot'
Write-Host "  3. Sur le téléphone : http://${ip}:3000"
Write-Host ''
Write-Host 'Pour revenir au mode PC seul : npm run lan:reset' -ForegroundColor DarkGray
