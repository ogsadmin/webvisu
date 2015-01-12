/**
 * utils.js
 * 
 * Sammlung von allgemeinen Hilfsfunktionen
 */

// gibt das Value eines "key=value" Paares aus der URL zurück
// under "undefined"
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
