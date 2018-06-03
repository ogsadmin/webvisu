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


// gibt das Value eines "key=value" Paares aus der URL zur�ck
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


// falls Array kein map unterst�tzt (f�r �ltere Browser)
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

//// String replaceAll
//// test performance 266ms vs RegExp 123ms
//String.prototype.replaceAll1 = function (target, replacement) {
//    return this.split(target).join(replacement);
//};

//// test performance 342ms vs RegExp 123ms
//String.prototype.replaceAll2 = function (src, dest) {
//    var text = this;
//    do {
//        text2 = text;
//        text = text2.replace(src, dest);
//    } while (text2 != text);
//    return text;
//};


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
        postFormat = POST_FORMAT_STANDARD;
    } else if (fileExists('/webvisu/visu_ini.xml')) {
        // eine neuere Wago (PFC-Serie)
        Log('found in /webvisu');
        plcDir = "/webvisu";
        postUrl = '/webvisu/webvisu.htm';
        postFormat = POST_FORMAT_STANDARD;
        // es handelt sich um eine CaseSensitive Linux-Steuerung
        filenamesLowercase = true;
    } else if (fileExists('/visu_ini.xml')) {
        // könnte eine Beck sein
        Log('found in /');
        plcDir = "";
        postUrl = '/webvisu.htm';
        postFormat = POST_FORMAT_STANDARD;
    } else if (fileExists('/TcWebVisu/visu_ini.xml')) {
        // müsste ein TwinCat (Beckhoff) sein
        Log('found in /TcWebVisu');
        plcDir = "/TcWebVisu";
        postUrl = '/UPnPDevice/TcPlcDataServiceDa.dll';
        postFormat = POST_FORMAT_SOAP;
    }
}


// diese Funktion startet einen performance-test um ein paar Unklarheiten zu beseitigen
function doPerfTest() {
    perfTestStart = new Date().getTime();
    for (a = 0; a < 10000; a++) {
        text = "dies ist ein | | kleiner |<|Test|>| um RegExp | | gegen |<|normalen|>| String-Replace zu vergleichen";
        // wegen des PreProcessors k�nnen wir leider keine /-Syntax f�r die RegEx nehmen
        text = text.replace(new RegExp('\\| \\|', 'g'), ' ');
        text = text.replace(new RegExp('\\|>\\|', 'g'), '>');
        text = text.replace(new RegExp('\\|<\\|', 'g'), '<');
    }
    perfTestEnd = new Date().getTime();
    perfTest = perfTestEnd - perfTestStart;
    Log("perTest RegExp=" + perfTest + "ms");

    //perfTestStart = new Date().getTime();
    //for (a = 0; a < 10000; a++) {
    //    text = "dies ist ein | | kleiner |<|Test|>| um RegExp | | gegen |<|normalen|>| String-Replace zu vergleichen";

    //    text = text.replaceAll1('| |', ' ');
    //    text = text.replaceAll1('|>|', '>');
    //    text = text.replaceAll1('|<|', '<');
    //}
    //perfTestEnd = new Date().getTime();
    //perfTest = perfTestEnd - perfTestStart;
    //Log("perTest replaceAll1=" + perfTest + "ms");

    //perfTestStart = new Date().getTime();
    //for (a = 0; a < 10000; a++) {
    //    text = "dies ist ein | | kleiner |<|Test|>| um RegExp | | gegen |<|normalen|>| String-Replace zu vergleichen";

    //    text = text.replaceAll2('| |', ' ');
    //    text = text.replaceAll2('|>|', '>');
    //    text = text.replaceAll2('|<|', '<');
    //}
    //perfTestEnd = new Date().getTime();
    //perfTest = perfTestEnd - perfTestStart;
    //Log("perTest replaceAll2=" + perfTest + "ms");
}