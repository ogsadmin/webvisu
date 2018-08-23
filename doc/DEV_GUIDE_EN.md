# Developer Guide (English)

## Credits
The initial english translation was done by Aliazzz - thanks for your great work!

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
- https://sourceforge.net/p/webvisu/code/HEAD/tree/
- Button "Download Snapshot"

Change to "trunk/src":
```bash
cd trunk/src
```

Call the release script:
```bash
./release.sh
```

After calling the release script both the files 
"WebVisu.html" and "WebVisuPlus.html" are generated in /trunk/release

The script "release.sh" can optionally be given the parameter "HTMLTITLE=".
This sets the title of the generated HTML file to the passed value.

Example:
```bash
./release.sh HTMLTITLE=WebVisu5
```

### Internal working of the Release process
The Release process internally runs twice. For every result file once.
During the Release process the results files with extension "\*.pp.*"
are processed by the Preprozessor. 
Support for the "steelseries" is either activated or removed.

The resultfiles are then merged in a single file. 
Furthermore, all "\*.js" files are obfuscated and compressed. 
After this, the codes 
```html
<script src="XXX.js"></script>
```
in the "WebViduDev.pp.html" file are replaced with the entire content of the
obfuscated and compression step.
This results in 
```html
<script>XXX</script>
```
within the "WebViduDev.pp.html" file. This way, external file dependancies are 
not needed any more.


## Development Process
During development, its very nice to debug the code without much effort. 
To achieve this, the sourcecode is optimized in such a way that it functions without external dependencies.


### Testing on a Target
It is possible to store the "\*.js" Files and the  WebVisuDev.pp.html directly 
in a target directory (a Codesys webserver root).
The "WebVisuDev.pp.html" should then be renamed to "WebVisuDev.html", because
otherwise the CoDeSys Webserver will interpret this file wrongly (as a "\*.pp"
- at least on my target PLC (of original Author) )
Files ending with "\*.min.js" can be copied directly.

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

Calling webvisualistaion is brand dependant (though but in most cases it's)
- http://[IP_ADDRESS_OF_PLC]/webserv/WebVisuDev.html

or
- http://[IP_ADDRESS_OF_PLC]/WebVisuDev.html


### Test under Linux
In directory /trunk/tools a minimalistic Python2 Webserver can be found. 
Difference with the Python-Documentation example lies in a changes ("Hacks") 
that ignore smaller and larger abnormalities in the incomming data.

To enable this, one should copy the PLC-files of the Visu-data from the PLC 
to a sub directory. (E.g.: /trunk/tickets/bug0815/PLC)

After this, the webserver can be started from  /trunk: 
```bash
cd /trunk
python tools/SimpleWebServer.py
```

The Webserver starts on Port 8080.

By calling from the Browser a PLC-path must be added, to store the error 
messages, if any:
- http://localhost:8080/src/WebVisuDev.pp.html?plcDir=/tickets/bug0815/PLC/

The Webserver only anwsers  in response to GETVALUE- and SETVALUE- requests 
from the Visu. The Webserver feeds every number with a "0" and every string 
with "Hallo".

For testing the Firefox-Developpersconsole can be used.

## Arguments in the URL
The WebVisu can be influenced by arguments in the URL.
How arguments are encoded in URLs should be clear, here again a Example as a
reminder:

- http://localhost:8080/src/WebVisuDev.pp.html?firstArg=1&secondArg=2&thirdArg=3

The first argument is separated with a "?", each additional argument with a "&".

- startVisu=...

  Sets the visualization file to be loaded as the beginning.
  Default: "plc_visu"

- plcDir=...

  Overwrites the automatic recognition of the PLC directory with the 
  specified value.

- postUrl=...

  Overrides the automatic recognition of the variable connection to the 
  target.

- logOverlayWriteout

  Activates a mini log window in the upper right corner. For browsers that
  do not provide a console.

- perfWriteout

  Activates a small performance window in the upper left corner in which the
  times required for loading and updating the screen or the variables are 
  displayed.

- useTouchEvents or dontUseTouchEvents

  Overrides the automatic detection of touch events and activates or deactivates
  them.

- doPerfTest

  Activates a small performance test. However, it is only used for development.

## Click handling (from r84)
With version r84 the handling of mouse clicks has been completely revised. 
Previously, click regions were determined on load and each of them was compared
in the handler functions with the point of the mouse events.
Since r84, click handling has been object-related and no longer works with 
coordinates, but with an invisible bitmap. During the graphical output of the
elements (on the browser) each element is also drawn on this invisible bitmap. 
The difference is that on the invisible bitmap each element is filled with a
certain color. This colour corresponds to the object ID.
During a mouse event, the (invisible) click bitmap now shows the color of the
point under the mouse and from this color the object ID is recalculated. The
click handler then knows which element was clicked.
This mechanism solves three main problems:
- Invisible elements are not drawn and therefore not detected anymore
- Click regions must always be rectangular. Circles or polygons become
  now evaluated correctly.
- If there are several click actions per element, they can now be evaluated 
  much faster. 

To encode the object ID in a color, the 24 bits of the color value are used as
a 24 bit integer. While the first 255 elements only using the blue portion,
the other elements are using the green and then the red portions.
The color value 0xFFFFFFFF is assigned to the background. 
