# Revenir au mode développement local (PC uniquement, localhost)
# Usage : depuis frontend/ →  npm run lan:reset

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$frontendEnv = Join-Path $root '.env.local'
$backendLocal = Join-Path (Split-Path $root -Parent) 'backend\src\main\resources\application-local.yml'

$frontendLine = 'NEXT_PUBLIC_API_URL=http://localhost:8080'
if (Test-Path $frontendEnv) {
  $content = Get-Content $frontendEnv -Raw
  if ($content -match '(?m)^NEXT_PUBLIC_API_URL=.*$') {
    $content = [regex]::Replace($content, '(?m)^NEXT_PUBLIC_API_URL=.*$', $frontendLine)
    Set-Content -Path $frontendEnv -Value $content.TrimEnd() -NoNewline -Encoding utf8
  }
}
Write-Host "Frontend : $frontendLine" -ForegroundColor Green

if (Test-Path $backendLocal) {
  $yaml = Get-Content $backendLocal -Raw
  $yaml = [regex]::Replace(
    $yaml,
    '(?ms)^app:\r?\n  frontend-url:.*?\r?\n  backend-public-url:.*?\r?\n  storage:\r?\n    public-base-url:.*?\r?\n',
    ''
  )
  Set-Content -Path $backendLocal -Value $yaml.TrimEnd() -NoNewline -Encoding utf8
  Write-Host 'Backend : URLs LAN retirées (défaut localhost via application.yml)' -ForegroundColor Green
}

Write-Host ''
Write-Host 'Mode localhost rétabli. Lancez : npm run dev' -ForegroundColor Cyan
