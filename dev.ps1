<#
  MyFlix dev launcher.

  Usage:
    .\dev.ps1          Start Jellyfin (background) + frontend dev server (foreground)
    .\dev.ps1 -Stop    Stop Jellyfin and the frontend dev server

  Jellyfin keeps running after you Ctrl+C the frontend. Use -Stop to shut it down.
#>
param([switch]$Stop)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dev = Join-Path $root '.dev'
$jfExe = Join-Path $dev 'jellyfin-server\jellyfin\jellyfin.exe'
$ffExe = Join-Path $dev 'jellyfin-server\jellyfin\ffmpeg.exe'
$frontend = Join-Path $root 'frontend'

function Stop-OnPort([int]$port) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

if ($Stop) {
  Write-Host 'Stopping frontend (:5173) and Jellyfin (:8096)...' -ForegroundColor Yellow
  Stop-OnPort 5173
  Stop-OnPort 8096
  Get-Process jellyfin -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host 'Stopped.' -ForegroundColor Green
  return
}

# --- Jellyfin ---
$jfUp = $null -ne (Get-NetTCPConnection -LocalPort 8096 -State Listen -ErrorAction SilentlyContinue)
if ($jfUp) {
  Write-Host '[1/2] Jellyfin already running on :8096' -ForegroundColor Green
} else {
  Write-Host '[1/2] Starting Jellyfin...' -ForegroundColor Cyan
  Start-Process -FilePath $jfExe -ArgumentList @(
    '--datadir',   (Join-Path $dev 'jellyfin-data'),
    '--cachedir',  (Join-Path $dev 'jellyfin-cache'),
    '--configdir', (Join-Path $dev 'jellyfin-config'),
    '--logdir',    (Join-Path $dev 'jellyfin-log'),
    '--ffmpeg',    $ffExe
  ) -WindowStyle Hidden
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    try { Invoke-RestMethod 'http://localhost:8096/System/Info/Public' -TimeoutSec 2 | Out-Null; $ready = $true; break }
    catch { Start-Sleep -Seconds 1 }
  }
  if ($ready) { Write-Host '      Jellyfin ready on :8096' -ForegroundColor Green }
  else { Write-Host '      Jellyfin did not respond in time (check .dev\jellyfin-log)' -ForegroundColor Red }
}

# --- Frontend (foreground; Ctrl+C to stop) ---
Write-Host '[2/2] Starting frontend dev server on :5173...' -ForegroundColor Cyan
Write-Host ''
Write-Host '  App:      http://localhost:5173   (login: nick / myflix-dev)' -ForegroundColor White
Write-Host '  Jellyfin: http://localhost:8096' -ForegroundColor DarkGray
Write-Host '  Ctrl+C stops the frontend; run  .\dev.ps1 -Stop  to also stop Jellyfin.' -ForegroundColor DarkGray
Write-Host ''
Set-Location $frontend
npm run dev
