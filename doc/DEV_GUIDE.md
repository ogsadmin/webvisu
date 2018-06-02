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

Danach kann man aus dem /trunk-Verzeichnis heraus den Webserver starten:
cd /trunk
python tools/SimpleWebServer.py

Der Webserver startet auf Port 8080.

Beim Aufruf im Browser muss nun noch der PLC-Pfad gesetzt werden, da die 
automatische Ermittlung fehlschlagen wird:
http://localhost:8080/src/WebVisuDev.pp.html?plcDir=/tickets/bug0815/PLC/

Der Webserver gibt nun die angefragten Dateien aus und antwortet auf GETVALUE-
und SETVALUE-Anfragen der Visu.
Dabei füttert er alle Zahlen mit "0" und alle Strings mit "Hallo".
Viel mehr tut er wirklich nicht.

Bei Tests kann man z.B. die Firefox-Entwicklerkonsole aktivieren. Dort werden
unter "Konsole" die Logausschriften aus den Sources ausgegeben.
