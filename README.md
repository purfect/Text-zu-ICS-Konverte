# Confluence-Termin nach Outlook

Eine lokale Firefox-Erweiterung fuer Termine, die in Confluence als Text gepflegt werden. Sie uebergibt den markierten Text an die installierte Outlook-Windows-Anwendung und liest keine Daten ausserhalb der gerade angezeigten Seite.

## Empfohlener Ablauf: Windows-Hotkey

Der zuverlaessigste Weg braucht keine Firefox-Erweiterung und umgeht Browser-Sicherheitsgrenzen:

1. Einmalig PowerShell ohne Administratorrechte in diesem Ordner oeffnen und `Set-ExecutionPolicy -Scope Process Bypass; .\install-outlook-hotkey.ps1` ausfuehren.
2. Text in Confluence markieren und mit `Strg+C` kopieren.
3. `Strg+Alt+O` druecken.

Outlook oeffnet sofort ein neues Terminfenster. Der kopierte Text steht unveraendert im Betreff. Ein Desktop-Symbol **Termin nach Outlook** steht als Alternative zum Hotkey bereit.

## Installation in Firefox

1. `about:debugging#/runtime/this-firefox` in Firefox oeffnen.
2. **Temporäres Add-on laden** waehlen.
3. Die Datei `manifest.json` aus diesem Ordner auswaehlen.

Firefox entfernt temporäre Add-ons beim Neustart. Fuer einen dauerhaften Einsatz muss die Erweiterung als signiertes Add-on verteilt werden.

Nach einer Aenderung **Aktualisieren** neben dem Add-on waehlen oder es erneut temporaer laden. Der Status **Angehalten** in `about:debugging` ist bei Firefox-Erweiterungen nach Leerlauf normal; er bedeutet nicht, dass das Kontextmenue deaktiviert ist.

## Outlook-Verbindung einmalig einrichten

Firefox darf Windows-Anwendungen nicht direkt starten. Der enthaltene Native Host stellt diese lokale Verbindung her und verwendet die klassische Outlook-Windows-Anwendung.

1. PowerShell ohne Administratorrechte im Ordner dieser Erweiterung oeffnen.
2. Ausfuehren: `Set-ExecutionPolicy -Scope Process Bypass; .\install-native-host.ps1`
3. Firefox-Erweiterung unter `about:debugging` aktualisieren oder Firefox neu starten.

Die Installation kopiert nur [native-host.ps1](native-host.ps1) in dein Benutzerprofil und setzt einen einzelnen Registry-Eintrag unter `HKCU`. Es werden keine Zugangsdaten, Netzwerkverbindungen oder Outlook-Daten gespeichert.

## Verwendung

1. Den gewünschten Text in Confluence markieren und mit der rechten Maustaste anklicken.
2. **Termin in Outlook oeffnen** waehlen.
3. Outlook öffnet direkt ein neues Terminfenster. Der markierte Text steht unverändert als Betreff darin.
4. Datum, Beginn, Ende und weitere Angaben direkt in Outlook festlegen und speichern.

Der markierte Text wird nicht interpretiert, gekuerzt oder formatiert, sondern als Betreff verwendet. Das Speichern bleibt bewusst der letzte Schritt in Outlook.

## Test

```powershell
node .\tests\content.test.js
```
