# HowTo
Wie das ganze funktioniert ist im [Wiki](http://sourceforge.net/p/webvisu/wiki/Home/) beschrieben. Hier nur eine kurze Anleitung:

## Voraussetzungen
- Die Web-Visualisierung der Steuerung muss im Projekt aktiviert sein. 
- Seit v18 kann die Option "Komprimierung" aktiviert oder deaktiviert sein - WebVisu kann jetzt beides verarbeiten. 
- Seit v76 werden "Dynamische Texte" unterstützt
- Mit v85 wurde das Klick-Handling komplett ueberarbeitet
- Ab v99 unterstuetzt die WebVisu auch die Sabo-Steuerungen

## Installation
- WebVisu.html mittels eines beliebigen FTP-Clients (z.B. WinSCP oder Filezilla) auf die Steuerung kopieren.
- Das Zielverzeichnis hängt dabei von der verwendeten Steuerung ab.
  Meisst ist man gut beraten die Datei dort abzulegen, wo auch CoDeSys seine webvisu.htm (ohne "L") oder index.html ablegt.
  - auf einer alten Wago ist es z.B. /webserv

## Aufrufen
Danach mit einem beliebigen Browser (auch iPad oder iPhone) die Steuerung ansurfen.
Auch hier hängt die URL wieder von der verwendeten Steuerung und den Pfad ab in den man die Datei kopiert hat.
- http://[IpMeinerSteuerung]/WebVisu.html
- http://[IpMeinerSteuerung]/webserv/WebVisu.html

Viel Spass!
