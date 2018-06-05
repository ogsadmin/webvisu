# Developer Guide (English translation from German v0.1 by Aliazzz)


## Build WebVisu.html
To generate WebVisu.html from the source files you will need
- the sources themselves,
- Linux-PC installation,
- PERL and
- GNU CPP (C-PreProcessor).

CPP is neccesery, because at the moment some "fancy" view elements 
"steelseries" in a special version of webvisu (=WebVisuPlus) are supported. 
!Support for this special version will sooner or later be dropped!

Download the Sources as a Snapshot:
https://sourceforge.net/p/webvisu/code/HEAD/tree/
Button "Download Snapshot"

Change to "trunk/src":
cd trunk/src

Call the release script:
./release.sh

After calling the release script both the files 
"WebVisu.html" and "WebVisuPlus.html" are generated in /trunk/release


### Internal working of the Release process
The Release process internally runs twice. For every result file once.
During the Release process the results files with extension *.pp.* 
are processed by the Preprozessor. 
Support for the "steelseries" is either activated or removed.

The resultfiles are then merged in a single file. 
Furthermore, all *.js files are obfuscated and compressed. 
After this, the codes "<script src="XXX.js"></script>" in the "WebViduDev.pp.html" file.
are replaced with the entire content of the obfuscated and compression step.
This results in "<script>XXX</script>" within the "WebViduDev.pp.html" file.
This way, external file dependancies are not needed any more.


## Development Process
During development, its very nice to debug the code without much effort. 
To achieve this, the sourcecode is optimized in such a way that it functions without external dependencies.


### Testing on a Target
It is possible to store the *.js Files and the  WebVisuDev.pp.html directly in a target directory (a Codesys webserver root).
The "WebVisuDev.pp.html" should then be renamed to "WebVisuDev.html", because otherwise the CoDeSys 
Webserver will interpret this file wrongly (as a *.pp  - at least on my target PLC (of original Author) )
Files ending with "*.min.js" can be copied directly.

The files to be copied to the target;
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

Calling the WebVisu:
Calling webvisualistaion is brand dependant (though but in most cases it's)
http://[IP_ADDRESS_OF_PLC]/webserv/WebVisuDev.html
or
http://[IP_ADDRESS_OF_PLC]/WebVisuDev.html


### Test unter Linux
In directory /trunk/tools a minimalistic Python2 Webserver can be found. 
Difference with the Python-Documentation example lies in a changes ("Hacks") 
that ignore smaller and larger abnormalities in the incomming data.

To enable this, one should copy the PLC-reports of the Visu-data from the PLC to a sub report.
E.g.: /trunk/tickets/bug0815/PLC

After this, the webserver can be started from  /trunk-Verzeichnis : 
cd /trunk
python tools/SimpleWebServer.py

The Webserver starts on Port 8080.

By calling from the Browser a PLC-path must be added, to store the error messages, if any:
http://localhost:8080/src/WebVisuDev.pp.html?plcDir=/tickets/bug0815/PLC/

The Webserver only anwsers  in response to GETVALUE- and SETVALUE- requests from the Visu.
The Webserver feeds every number with a "0" and every string with "Hallo".

For testing the Firefox-Developpersconsole can be used.