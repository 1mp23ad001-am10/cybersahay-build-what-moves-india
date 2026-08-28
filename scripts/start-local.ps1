$workspacePath = 'D:\build what moves'
$logPath = Join-Path $workspacePath 'logs'
New-Item -ItemType Directory -Path $logPath -Force | Out-Null

function Test-ListeningPort([int]$Port) {
  return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}

if (-not (Test-ListeningPort 8787)) {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run server 1>> logs\api.log 2>>&1' -WorkingDirectory $workspacePath -WindowStyle Hidden
}

if (-not (Test-ListeningPort 5173)) {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort 1>> logs\web.log 2>>&1' -WorkingDirectory $workspacePath -WindowStyle Hidden
}
