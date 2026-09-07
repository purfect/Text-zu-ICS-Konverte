$ErrorActionPreference = 'Stop'

$installDir = Join-Path $env:LOCALAPPDATA 'Confluence-Outlook-Terminator'
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
$scriptPath = Join-Path $installDir 'outlook-from-clipboard.ps1'
Copy-Item (Join-Path $PSScriptRoot 'outlook-from-clipboard.ps1') $scriptPath -Force

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Termin nach Outlook.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -STA -File `"$scriptPath`""
$shortcut.WorkingDirectory = $installDir
$shortcut.Description = 'Erstellt aus dem kopierten Text einen neuen Outlook-Termin.'
$shortcut.Hotkey = 'CTRL+ALT+O'
$shortcut.Save()

Write-Host 'Hotkey eingerichtet: Text kopieren und Strg+Alt+O druecken.'