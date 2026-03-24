function Backup-PreJudFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath
  )

  $backupDir = "C:\prejud-saas-new\bkp"
  New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $name = [System.IO.Path]::GetFileNameWithoutExtension($SourcePath)
  $ext = [System.IO.Path]::GetExtension($SourcePath)
  $dest = Join-Path $backupDir "${name}__BKP__$stamp$ext"

  Copy-Item -LiteralPath $SourcePath -Destination $dest -Force
  Write-Host "Backup criado em:" $dest -ForegroundColor Green
}
