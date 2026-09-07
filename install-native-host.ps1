$ErrorActionPreference = 'Stop'

$installDir = Join-Path $env:LOCALAPPDATA 'Confluence-Outlook-Terminator'
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
$hostScript = Join-Path $installDir 'native-host.ps1'
Copy-Item (Join-Path $PSScriptRoot 'native-host.ps1') $hostScript -Force
$hostCommand = Join-Path $installDir 'native-host.cmd'
Copy-Item (Join-Path $PSScriptRoot 'native-host.cmd') $hostCommand -Force

$manifestPath = Join-Path $installDir 'confluence_outlook.json'
$manifest = @{
    name = 'confluence_outlook'
    description = 'Erstellt Outlook-Termine aus der Firefox-Erweiterung.'
    path = $hostCommand
    type = 'stdio'
    allowed_extensions = @('confluence-outlook@local')
}
$json = $manifest | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($manifestPath, $json, [System.Text.UTF8Encoding]::new($false))

$registryPath = 'Software\Mozilla\NativeMessagingHosts\confluence_outlook'
foreach ($view in @([Microsoft.Win32.RegistryView]::Registry64, [Microsoft.Win32.RegistryView]::Registry32)) {
    $baseKey = [Microsoft.Win32.RegistryKey]::OpenBaseKey([Microsoft.Win32.RegistryHive]::CurrentUser, $view)
    try {
        $registryKey = $baseKey.CreateSubKey($registryPath)
        try {
            $registryKey.SetValue('', $manifestPath, [Microsoft.Win32.RegistryValueKind]::String)
        } finally {
            $registryKey.Dispose()
        }
    } finally {
        $baseKey.Dispose()
    }
}
Write-Host 'Native Messaging fuer Outlook wurde eingerichtet. Firefox-Erweiterung aktualisieren oder Firefox neu starten.'