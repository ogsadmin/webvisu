# Developer Guide (German)

## Build WebVisu.html
Um ein WebVisu.html aus den Sources zu generieren benötigt man
- die Sources,
- einen Linux-Rechner,
- PERL und
- den GNU CPP (C-PreProzessor).

Der CPP ist notwendig, da aktuell (noch) ein paar fancy Anzeigeelemente 
(steelseries) mittels einer Sonderversion unterstützt werden. Diese 
Unterstützung ist aber eher eine Sackgasse und wird über kurz oder lang
wieder entfernt.

Download der Sources als Snapshot:
https://sourceforge.net/p/webvisu/code/HEAD/tree/
Button "Download Snapshot"

Wechsel in "trunk/src":
cd trunk/src

Aufruf des Release-Skript:
./release.sh

Daraufhin werden im Verzeichnis /trunk/release die beiden Dateien 
"WebVisu.html" und "WebVisuPlus.html" neu erzeugt.

### Ablauf des Releaseprozesses
Der Releaseprozess läuft intern zwei mal ab. Für jede Ergebnisdatei ein mal.
Während des Releaseprozess werden zunächst die Dateien mit der Endung *.pp.* 
durch den Preprozessor geschickt. Hierbei wird die Unterstützung für 
"steelseries" entweder aktiviert oder gelöscht.

Die Ergebnisdateien werden daraufhin in jerweils eine einzige Datei 
zusammengeführt. Zunächst werden alle *.js Dateien über einen Kompressor 
(Obfuscator) komprimiert. Danach werden in der Datei "WebViduDev.pp.html"
die Codestellen
  "<script src="XXX.js"></script>" 
mittels Textersetzung durch den Inhalt der im Kompressionsschritt erzeugten 
Dateien ersetzt:
  "<script>XXX</script>"
Hierdurch entsteht (jeweils) eine einzige Datei, welche der Anwender ohne
Abhängigkeiten auf sein Target spielen kann.


## Entwicklungsprozess
Während der Entwicklung ist es notwendig Änderungen mit möglichst wenig 
Aufwand testen zu können. Hierfür sind die Sources so aufgebaut, dass sie auch
ohne vorheriges Release (Zusammenpacken) funktionieren.

### Test auf dem Target
Man kann die Dateien *.js und die Datei WebVisuDev.pp.html direkt auf ein 
Target spielen. Die Datei "WebVisuDev.pp.html" sollte dabei nach 
"WebVisuDev.html" umbenannt werden, da der CoDeSys Webserver sie ansonsten als 
*.pp interpretieren möchte - zumindest auf den mir bisher zur Verfügung 
stehenden Steuerungen.
Bei Dateien, zu denen es eine "*.min.js" Version gibt muss diese anstatt des 
ungepackten Pendants aufgespielt werden.
Also:
- codesys.pp.js
- drawing.pp.js
- inflate.js
- jquery-2.0.3.min.js
- jquery-ajax-blob-arraybuffer.js
- sprintf.js
- steelseries-min.js
- utils.pp.js
- WebVisuDev.pp.html => WebVisuDev.html
- zip.js

Jetzt sollte man die WebVisu aufrufen können mittels:
http://[IP meiner Steuerung]/webserv/WebVisuDev.html

### Test unter Linux
Unter /trunk/tools liegt ein minimalistischer Python2 Webserver. Der 
Unterschied zum Beispiel aus der Python-Doku ist, dass er mittels eines kleinen
Hacks die Groß- und Kleinschreibung der zu ladenden Dateien ignoriert.

Um diesen nutzen zu können muss man zunächst das PLC-Verzeichnis mit den Visu-
Dateien von einer Steuerung in ein Unterverzeichnis kopieren.
Beispiel: /trunk/tickets/bug0815/PLC
Oder wie bereits vorhanden: /trunk/tests/targetfiles/PLC_PRG

Danach kann man aus dem /trunk-Verzeichnis heraus den Webserver starten:
cd /trunk
python tools/SimpleWebServer.py

Der Webserver startet auf Port 8080.

Beim Aufruf im Browser muss nun noch der PLC-Pfad gesetzt werden, da die 
automatische Ermittlung fehlschlagen wird:
http://localhost:8080/src/WebVisuDev.pp.html?plcDir=/tickets/bug0815/PLC/
oder:
http://localhost:8080/src/WebVisuDev.pp.html?plcDir=/tests/targetfiles/PLC_PRG/

Der Webserver gibt nun die angefragten Dateien aus und antwortet auf GETVALUE-
und SETVALUE-Anfragen der Visu.
Dabei füttert er alle Zahlen mit "0" und alle Strings mit "Hallo".
Viel mehr tut er wirklich nicht.

Bei Tests kann man z.B. die Firefox-Entwicklerkonsole aktivieren. Dort werden
unter "Konsole" die Logausschriften aus den Sources ausgegeben.

## Argumente in der URL
Die WebVisu kann über Argumente in der URL beeinflusst werden.
Wie Argumente in URLs kodiert werden sollte klar sein, hier noch mal ein 
Beispiel als Gedankenstütze:

http://localhost:8080/src/WebVisuDev.pp.html?firstArg=1&secondArg=2&thirdArg=3

Das erste Argument wird also mit einem "?", jedes weitere Argument mit einem 
"&" getrennt.

startVisu=...
  Stellt die Visualisierungsdatei ein, welche als Beginn geladen werden soll.
  Default: "plc_visu"

plcDir=...
  Überschreibt die automatische Erkennung des PLC-Verzeichnisses mit dem 
  angegebenen Wert.

postUrl=...
  Überschreibt die automatische Erkennung der Variablen-Anbindung an die 
  Steuerung.

logOverlayWriteout
  Aktiviert ein Mini-Logfenster in der rechten oberen Ecke. Für Browser, welche
  keine Konsole zur Verfügung stellen.

perfWriteout
  Aktiviert ein kleines Performance-Fenster in der linken oberen Ecke in 
  welchem ständig die benötigten Zeiten für Laden und Aktualisierung der Visu
  bzw. der Variablen angezeigt wird.

useTouchEvents
dontUseTouchEvents
  Überschreibt die automatische Erkennung von Touch-Events und aktiviert bzw. 
  deaktiviert diese.

doPerfTest
  Aktiviert einen kleinen Performance-Test.

## Klick-Handling (ab r84)
Mit Version r84 wurde das Handling von Maus-Klicks komplett überarbeitet. 
Vorher war es so, dass Klick-Regionen ermittelt wurden, welche jeweils in den
Handler-Funktionen abgearbeitet und deren Koordinaten mit dem Punkt des Maus-
Eevents verglichen wurden.
Seit r84 ist das Klick-Handling objektbezogen und arbeitet nicht mehr mit 
Koordinaten, sondern mit einer unsichtbaren Bitmap. Auf dieser Bitmap wird 
während der grafischen Ausgabe der Elemente (auf dem Browser) jedes Element 
nochmals gezeichnet. Der Unterschied ist, dass auf der unsichtbaren Bitmap 
jedes Element mit einer bestimmten Farbe gefüllt wird. Diese Farbe entspricht
nicht der eingestellten Farbe, sondern repräsentiert die Objekt-ID.
Bei einem Maus-Event wird nun auf der (unsichtbaren) Klick-Bitmap die Farbe des
Punktes unter der Maus ermittelt und aus dieser Farbe die Objekt-ID 
rückgerechnet. Der Klick-Handler weiß dann welches Element angeklickt wurde.
Durch diesen Mechnismus werden drei Hauptprobleme erschlagen:
- Unsichtbare Elemente werden nicht gezeichnet und entsprechend auch nicht
  mehr als Klick-Bereich ausgewertet.
- Klick-Regionen mussten immer rechteckig sein. Kreise oder Polygone werden
  jetzt ausgewertet wie gezeichnet.
- Bei mehreren Klich-Aktionen pro Element können diese jetzt schneller 
  ausgewertet werden.

Um die Objekt-ID in einer Farbe kodieren zu kodieren werden die 24 Bit des 
Farbwertes als 24 Bit Integer verwendet. Die ersten 255 Elemente verwenden 
entsprechend nur den Blau-Anteil, danach kommt Grün und danach Rot hinzu.
Der Farbwert 0xFFFFFF ist dem Hintergrund zugeordnet. 
