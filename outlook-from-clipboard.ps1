Add-Type -AssemblyName System.Windows.Forms

$subject = [Windows.Forms.Clipboard]::GetText().Trim()
if ([string]::IsNullOrWhiteSpace($subject)) {
    [Windows.Forms.MessageBox]::Show(
        'Bitte zuerst einen Text markieren und mit Strg+C kopieren.',
        'Termin nach Outlook',
        [Windows.Forms.MessageBoxButtons]::OK,
        [Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
    exit 1
}

try {
    $outlook = New-Object -ComObject Outlook.Application
    $appointment = $outlook.CreateItem(1)
    $appointment.Subject = $subject
    $appointment.Display()
} catch {
    [Windows.Forms.MessageBox]::Show(
        "Outlook konnte nicht geoeffnet werden:`n$($_.Exception.Message)",
        'Termin nach Outlook',
        [Windows.Forms.MessageBoxButtons]::OK,
        [Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
    exit 1
}