# Tunnel HTTPS public (cloudflared quick tunnel) vers le frontend - test sur téléphone / Google OAuth.
# Usage : depuis frontend/ →  npm run tunnel
# L'URL change à chaque lancement : le script met à jour .env.local et prépare la commande backend.
# Pour revenir au mode PC seul : npm run lan:reset

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$frontendEnv = Join-Path $root '.env.local'
$backendDir = Join-Path (Split-Path $root -Parent) 'backend'
$stderrLog = Join-Path $env:TEMP 'skraft-cloudflared.log'
$stdoutLog = Join-Path $env:TEMP 'skraft-cloudflared.out.log'

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Error 'cloudflared introuvable. Installez-le : winget install --id Cloudflare.cloudflared'
}

Remove-Item $stderrLog, $stdoutLog -ErrorAction SilentlyContinue

Write-Host 'Démarrage du tunnel cloudflared vers http://localhost:3000 ...' -ForegroundColor Cyan
$tunnel = Start-Process cloudflared `
  -ArgumentList 'tunnel', '--url', 'http://localhost:3000' `
  -NoNewWindow -PassThru `
  -RedirectStandardError $stderrLog `
  -RedirectStandardOutput $stdoutLog

$url = $null
$deadline = (Get-Date).AddSeconds(60)
while (-not $url -and (Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
  if ($tunnel.HasExited) {
    Write-Error "cloudflared s'est arrêté. Voir $stderrLog"
  }
  if (Test-Path $stderrLog) {
    $match = Select-String -Path $stderrLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
    if ($match) { $url = $match.Matches[0].Value }
  }
}

if (-not $url) {
  Stop-Process -Id $tunnel.Id -ErrorAction SilentlyContinue
  Write-Error "Aucune URL de tunnel reçue en 60 s. Voir $stderrLog"
}

# --- Frontend .env.local ---
$frontendLine = "NEXT_PUBLIC_API_URL=$url"
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

# --- Backend : commande prête à coller ---
$redirectUri = "$url/api/auth/oauth/google/callback"
$backendCommand = @"
cd "$backendDir"
`$env:SPRING_PROFILES_ACTIVE = "local"
`$env:FRONTEND_URL = "$url"
`$env:APP_OAUTH_GOOGLE_REDIRECTURI = "$redirectUri"
mvn spring-boot:run
"@
Set-Clipboard -Value $backendCommand

Write-Host ''
Write-Host "Tunnel : $url" -ForegroundColor Green
Write-Host "Frontend : $frontendEnv mis à jour" -ForegroundColor Green
Write-Host ''
Write-Host 'Prochaines étapes :' -ForegroundColor Yellow
Write-Host '  1. Relancer le frontend (Ctrl+C puis npm run dev) - NEXT_PUBLIC_* est lu au démarrage'
Write-Host '  2. Relancer le backend : la commande est copiée dans le presse-papiers (Ctrl+V dans un terminal) :'
Write-Host ''
Write-Host $backendCommand -ForegroundColor DarkGray
Write-Host ''
Write-Host '  3. Google Cloud Console > Identifiants > client OAuth > URI de redirection autorisés, ajouter :'
Write-Host "     $redirectUri" -ForegroundColor White
Write-Host "  4. Ouvrir sur le téléphone : $url"
Write-Host ''
Write-Host 'Laisser cette fenêtre ouverte. Ctrl+C arrête le tunnel ; ensuite : npm run lan:reset' -ForegroundColor DarkGray

Wait-Process -Id $tunnel.Id
