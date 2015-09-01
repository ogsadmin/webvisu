/**
 * utils.js
 * 
 * Sammlung von allgemeinen Hilfsfunktionen
 */

// LOGGING
function Log(text) {
    if (logOverlayWriteout > 0) {
        logOverlayText += text + "\n";
    }
    console.log(text);
}


// gibt das Value eines "key=value" Paares aus der URL zurück
// oder "undefined"
function getUrlParameter(key) {
    var query = window.location.search.substring(1); 
    var pairs = query.split('&');
 
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if(pair[0] == key) {
            if(pair[1].length > 0)
                return pair[1];
        }  
    }
 
    return undefined;  
};


// falls Array kein map unterstützt (für ältere Browser)
// damit kann man z.B.: var b = a.split(',').map(Number);
Array.prototype.map = Array.prototype.map || function (_x) {
    for (var o = [], i = 0; i < this.length; i++) {
        o[i] = _x(this[i]);
    }
    return o;
};

// String startsWith and endsWith
String.prototype.startsWith = String.prototype.startsWith || function (prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = String.prototype.endsWith || function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
//  return this.match(suffix + "$") == suffix;
};


function fileExists(url) {
    exists = false;
    $.ajax({
        type: 'GET',
        async: false,
        url: url,
        success: function () { exists = true; }
    });
    return exists;
}

function determineVisuLocation() {
    // finden wir mal heraus wo unsere Visu liegt
    Log('determine visu location - searching visu_ini.xml');
    if (fileExists('/PLC/visu_ini.xml')) {
        // scheint eine Wago zu sein
        Log('found in /PLC');
        plcDir = "/PLC";
        postUrl = '/plc/webvisu.htm';
    } else if (fileExists('/visu_ini.xml')) {
        // könnte eine Beck sein
        Log('found in /');
        plcDir = "";
        postUrl = '/webvisu.htm';
    }
}
