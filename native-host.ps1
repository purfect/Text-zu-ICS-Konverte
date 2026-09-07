$ErrorActionPreference = 'Stop'

function Read-Exact([System.IO.Stream]$stream, [int]$length) {
    $buffer = New-Object byte[] $length
    $offset = 0
    while ($offset -lt $length) {
        $read = $stream.Read($buffer, $offset, $length - $offset)
        if ($read -eq 0) { return $null }
        $offset += $read
    }
    return $buffer
}

function Write-Response([object]$response) {
    $output = [Console]::OpenStandardOutput()
    $json = [Text.Encoding]::UTF8.GetBytes(($response | ConvertTo-Json -Compress))
    $length = [BitConverter]::GetBytes([int]$json.Length)
    $output.Write($length, 0, $length.Length)
    $output.Write($json, 0, $json.Length)
    $output.Flush()
}

try {
    $input = [Console]::OpenStandardInput()
    $lengthBytes = Read-Exact $input 4
    if ($null -eq $lengthBytes) { exit 0 }
    $length = [BitConverter]::ToInt32($lengthBytes, 0)
    if ($length -lt 1 -or $length -gt 1048576) { throw 'Ungueltige Nachrichtengroesse.' }
    $messageBytes = Read-Exact $input $length
    $message = [Text.Encoding]::UTF8.GetString($messageBytes) | ConvertFrom-Json
    $subject = [string]$message.subject
    if ([string]::IsNullOrWhiteSpace($subject)) { throw 'Kein Betreff uebergeben.' }

    $outlook = New-Object -ComObject Outlook.Application
    $appointment = $outlook.CreateItem(1)
    $appointment.Subject = $subject.Trim()
    $appointment.Display()
    Write-Response @{ ok = $true }
} catch {
    Write-Response @{ ok = $false; error = $_.Exception.Message }
    exit 1
}