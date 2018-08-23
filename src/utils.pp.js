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
    if (fileExists('/plc/visu_ini.xml')) {
        // scheint eine Wago zu sein
        Log('found in /plc');
        plcDir = "/plc";
        postUrl = '/plc/webvisu.htm';
        postFormat = POST_FORMAT_STANDARD;
    } else if (fileExists('/webvisu/visu_ini.xml')) {
        // eine neuere Wago (PFC-Serie)
        Log('found in /webvisu');
        plcDir = "/webvisu";
        postUrl = '/webvisu/webvisu.htm';
        postFormat = POST_FORMAT_STANDARD;
    } else if (fileExists('/visu_ini.xml')) {
        // könnte eine Beck oder Sabo sein
        Log('found in /');
        plcDir = "";
        postUrl = '/webvisu.htm';
        postFormat = POST_FORMAT_STANDARD;
        if (fileExists('/WebVisu5.cfg')) {
            // ist eine Sabo mit Webserver ab V2180730
            Log('Detected Sabo PLC');
        }
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
        // wegen des PreProcessors können wir leider keine /-Syntax für die RegEx nehmen
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

function getBrowserOS() {
    var os = 'unknown';
    var ua = navigator.userAgent;

	if (ua.match(/Win(dows )?NT 6\.0/)) {
		os = "Windows Vista";
	} else if (ua.match(/Win(dows )?(NT 5\.1|XP)/)) {
		os = "Windows XP";
	} else {
		if ((ua.indexOf("Windows NT 5.1") != -1) || (ua.indexOf("Windows XP") != -1)) {
			os = "Windows XP";
		} else if ((ua.indexOf("Windows NT 7.0") != -1) || (ua.indexOf("Windows NT 6.1") != -1)) {
			os = "Windows 7";
		} else if ((ua.indexOf("Windows NT 8.0") != -1) || (ua.indexOf("Windows NT 6.2") != -1)) {
			os = "Windows 8";
		} else if ((ua.indexOf("Windows NT 8.1") != -1) || (ua.indexOf("Windows NT 6.3") != -1)) {
			os = "Windows 8.1";
		} else if ((ua.indexOf("Windows NT 10.0") != -1) || (ua.indexOf("Windows NT 6.4") != -1)) {
			os = "Windows 10";
		} else if ((ua.indexOf("iPad") != -1) || (ua.indexOf("iPhone") != -1) || (ua.indexOf("iPod") != -1)) {
			os = "Apple iOS";
		} else if (ua.indexOf("Android" != -1)) {
			os = "Android Phone";
		} else if (ua.match(/Win(dows )?NT( 4\.0)?/)) {
			os = "Windows NT";
		} else if (ua.match(/Mac|PPC/)) {
			os = "Mac OS";
		} else if (ua.match(/Linux/)) {
			os = "Linux";
		} else if (ua.match(/(Free|Net|Open)BSD/)) {
			os = RegExp.$1 + "BSD";
		} else if (ua.match(/SunOS/)) {
			os = "Solaris";
		}
	}
	if (os.indexOf("Windows") != -1) {
		if (ua.indexOf('WOW64') > -1 || ua.indexOf('Win64') > -1) {
			os += ' 64bit';
		} else {
			os += ' 32bit';
		}
    }
    
	return os;
}