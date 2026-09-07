# Termin nach Outlook

Ein kleiner Windows-Helfer, der kopierten Text als Betreff eines neuen Outlook-Termins verwendet.

## Einmalig einrichten

PowerShell ohne Administratorrechte in diesem Ordner oeffnen und ausfuehren:

```powershell
Set-ExecutionPolicy -Scope Process Bypass; .\install-outlook-hotkey.ps1
```

Das Skript kopiert den Helfer in dein Benutzerprofil und erstellt auf dem Desktop die Verknuepfung **Termin nach Outlook** mit dem Hotkey `Strg+Alt+O`.

## Verwendung

1. Beliebigen Text markieren und mit `Strg+C` kopieren.
2. `Strg+Alt+O` druecken oder die Desktop-Verknuepfung oeffnen.
3. Outlook zeigt einen neuen Termin mit dem kopierten Text als Betreff.
4. Datum, Uhrzeit und weitere Angaben in Outlook eintragen und speichern.

Der Helfer speichert keine Daten und greift nur auf die aktuelle Zwischenablage zu.
