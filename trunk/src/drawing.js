// drawing.js

var visuVariables = {};
var drawObjects = [];
var drawTexts = [];
var clickToggles = [];
var clickTap = [];
var clickZoom = [];

var visuName = "";
var visuSizeX = 0;
var visuSizeY = 0;

function switchToVisu(visu) {
    // alle Arrays und Variablenzuordnungen löschen
    visuVariables = {};
    drawObjects = [];
    drawTexts = [];
    clickToggles = [];
    clickTap = [];
    clickZoom = [];

    visuName = "";
    visuSizeX = 0;
    visuSizeY = 0;

    // INIs neu laden
    load_ini("../PLC/visu_ini.xml");
    // neue Visu laden
    load_visu("../PLC/" + visu + ".xml");
}

// ****************************************************************************
// Variables

// constructor
function newVariable(name, addr, value) {
	this.name = name;
	this.addr = addr;
	this.addrP = addr.replace(/,/g, '|');
	this.value = value;
	var addrFields = addr.split(",");
	this.numBytes = addrFields[2];
}

function registerVariable(name, addr, value) {
	visuVariables[name] = new newVariable(name, addr, '');
}

// ****************************************************************************
// Rectangles

// constructor
function newRectangle(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm, leftExpr, topExpr, rightExpr, bottomExpr) {
    this.isA = "Rectangle";
    this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.fillStyle = fillStyle;
	this.lineWidth = lineWidth;
	this.strokeStyle = strokeStyle;
	this.alarmExpr = alarmExpr;
	this.fillStyleAlarm = fillStyleAlarm;
	this.leftExpr = leftExpr;
	this.topExpr = topExpr;
	this.rightExpr = rightExpr;
	this.bottomExpr = bottomExpr;
}

function registerRectangle(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm, leftExpr, topExpr, rightExpr, bottomExpr) {
    drawObjects.push(new newRectangle(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm, leftExpr, topExpr, rightExpr, bottomExpr));
}

// ****************************************************************************
// RoundRectangles

// constructor
function newRoundRect(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm) {
    this.isA = "RoundRect";
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.fillStyle = fillStyle;
	this.lineWidth = lineWidth;
	this.strokeStyle = strokeStyle;
	this.alarmExpr = alarmExpr;
	this.fillStyleAlarm = fillStyleAlarm;
}

function registerRoundRect(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm) {
    drawObjects.push(new newRoundRect(x, y, w, h, fillStyle, lineWidth, strokeStyle, alarmExpr, fillStyleAlarm));
}

// ****************************************************************************
// Text

// constructor
function newText(x, y, format, exprTextDisplay, fillStyle, textAlignHorz, textAlignVert, fontName, fontHeight) {
    this.isA = "Text";
    this.x = parseInt(x);
	this.y = parseInt(y);
	this.format = format;
	this.exprTextDisplay = exprTextDisplay;
	this.fillStyle = fillStyle;
	this.textAlignHorz = textAlignHorz;
	this.textAlignVert = textAlignVert;
	this.fontName = fontName;
	this.fontHeight = fontHeight;
}

function registerText(x, y, format, exprTextDisplay, fillStyle, textAlignHorz, textAlignVert, fontName, fontHeight) {
    drawTexts.push(new newText(x, y, format, exprTextDisplay, fillStyle, textAlignHorz, textAlignVert, fontName, fontHeight));
}

// ****************************************************************************
// Bitmap

// constructor
function newBitmap(x, y, w, h, fileName) {
    this.isA = "Bitmap";
    this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.fileName = fileName;
	this.img = new Image();
	this.img.src = '../PLC/' + fileName;
}

function registerBitmap(x, y, w, h, fileName) {
    drawObjects.push(new newBitmap(x, y, w, h, fileName));
}

// ****************************************************************************
// ClickToggle

// constructor
function newClickToggle(x, y, w, h, variable) {
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.variable = variable;
}

function registerClickToggle(x, y, w, h, variable) {
	clickToggles.push(new newClickToggle(x, y, w, h, variable));
}


// ****************************************************************************
// ClickTap

// constructor
function regClickTap(x, y, w, h, variable, newval) {
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.variable = variable;
	this.newval = newval;
}

function registerClickTap(x, y, w, h, variable, newval) {
	clickTap.push(new regClickTap(x, y, w, h, variable, newval));
}

// ****************************************************************************
// ClickZoom

// constructor
function regClickZoom(x, y, w, h, visu) {
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.visu = visu;
}

function registerClickZoom(x, y, w, h, visu) {
	clickZoom.push(new regClickZoom(x, y, w, h, visu));
}

/*
d,i  Dezimale Zahl
o    Oktale Zahl ohne Vorzeichen (ohne führende Null)
x    Hexadezimale Zahl ohne Vorzeichen (ohne führendes 0x)
u    Dezimale Zahl ohne Vorzeichen
c    Einzelnes Zeichen
s    Zeichenkette
f    REAL-Werte; Syntax: %|<Ausrichtung><Minimal angezeigte Anzahl von Zeichen>.<Genauigkeit>|f Ausrichtung wird durch Minuszeichen (linksbündig) bzw. Pluszeichen (rechtsbündig, Default) definiert; Genauigkeit definiert die Anzahl der Stellen hinter dem Komma (Default: 6).Beispiel siehe unten.

falls %t:
%a   Name des Wochentags, abgekürzt, z.B. "Wed"
%A   Name des Wochentags, volle Länge, z.B. "Wednesday"
%b   Monatsname, abgekürzt, z.B. "Feb"
%B   Monatsname, volle Länge, z.B. "February"
%c   Datum und Uhrzeit im Format <Monat>/<Tag>/<Jahr> <Stunden>:<Minuten>:<Sekunden>,z.B. "08/28/02 16:58:45"
%d   Monatstag als Zahl (01-31), z.B. "24"
%H   Stundenangabe, 24-Stundenformat (01-24), z.B. "16"
%I   Stundenangabe, 12-Stundenformat (01-12), z.B. "05" für 17 Uhr
%j   Tag des Jahres (001 – 366), z.B. "241
%m   Monat (01 – 12), z.B. "3" für März
%M   Minuten (00 – 59), z.B. "13"
%p   Aktueller Anzeiger AM (Stunden <12) bzw. PM (>12) für die Angabe im 12-Stundenformat, z.B. "AM", wenn es gerade 9 Uhr vormittags ist.
%S   Sekunden (00 – 59)
%U   Wochenangabe als Zahl, wobei Sonntag als erster Tag der Woche gerechnet wird) (00 – 53 für 53 mögliche Wochen eines Jahres)
%w   Wochentag als Zahl (0 – 6; Sonntag = 0)
%W   Wochenangabe als Zahl, wobei Montag als erster Tag der Woche gerechnet wird) (00 – 53 für 53 mögliche Wochen eines Jahres)
%x   Datum im Format <Monat>/<Tag>/<Jahr>, z.B. "08/28/02"
%X   Uhrzeit im Format <Stunden>:<Minuten>:<Sekunden>, z.B. "16:58:45"
%y   Jahresangabe ohne Jahrhunderte (00 – 99), z.B. "02"
%Y   Jahresangabe mit Jahrhunderten, z.B. "2002"
%z,%Z Angabe der Zeitzone (keine Angabe, falls die Zeitzone nicht bekannt ist), z.B. "Westeuropäische Sommerzeit"
%%   Prozentzeichen
*/
function strformat(format, val) {
	format = format.replace("%d", val);
	format = format.replace("%i", val);
	format = format.replace("%o", val);
	format = format.replace("%x", val);
	format = format.replace("%u", val);
	format = format.replace("%c", val);
	format = format.replace("%s", val);
	format = format.replace("%f", val);

	format = format.replace(/\| \|/g, ' ');

	return format;
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
	this.closePath();
	return this;
}

function evalExpression(expr) {
	var result = [];
	//console.log("evalExpression");
	for (var i = 0; i < expr.length; i = i + 1) {
	    if (expr[i].operation == 'var') {
	        //console.log("push var " + expr[i].value + " ( " + visuVariables[expr[i].value].value + " ) ");
	        result.push(visuVariables[expr[i].value].value);
	    } else if (expr[i].operation == 'const') {
	        result.push(parseFloat(expr[i].value));
	    } else if (expr[i].operation == 'op') {
	        if (expr[i].value == 'OR(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v1 || v2);
	        } else if (expr[i].value == 'AND(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v1 && v2);
	        } else if (expr[i].value == '/(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v2 / v1);
	        } else if (expr[i].value == '*(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v2 * v1);
	        } else if (expr[i].value == '+(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v2 + v1);
	        } else if (expr[i].value == '-(2)') {
	            var v1 = result.pop();
	            var v2 = result.pop();
	            result.push(v2 - v1);
	        }
	    }
	}
	return result[0];
}

function draw() {
	//get a reference to the canvas
	var ctx = $('#canvas')[0].getContext("2d");

	//clear background
	ctx.beginPath();
	ctx.clearRect(0, 0, visuSizeX, visuSizeY);
	ctx.closePath();

	for (var i in drawObjects) {
	    obj = drawObjects[i];
	    if (obj.isA == "Rectangle") {
	        ctx.beginPath();

	        var left = 0;
	        if (obj.leftExpr.length > 0) { left = evalExpression(obj.leftExpr); }
	        var top = 0;
	        if (obj.topExpr.length > 0) { top = evalExpression(obj.topExpr); }
	        var right = 0;
	        if (obj.rightExpr.length > 0) { right = evalExpression(obj.rightExpr); }
	        var bottom = 0;
	        if (obj.bottomExpr.length > 0) { bottom = evalExpression(obj.bottomExpr); }

	        ctx.rect(obj.x + left, obj.y + top, obj.w + right, obj.h + bottom);
	        // ctx.fillStyle = "rgba("+fill_color+",1)";
	        if (obj.alarmExpr.length > 0) {
	            if (evalExpression(obj.alarmExpr) > 0) {
	                ctx.fillStyle = obj.fillStyleAlarm;
	            } else {
	                ctx.fillStyle = obj.fillStyle;
	            }
	        } else {
	            ctx.fillStyle = obj.fillStyle;
	        }
	        ctx.fill();
	        ctx.lineWidth = obj.lineWidth;
	        ctx.strokeStyle = obj.strokeStyle;
	        ctx.stroke();
	        ctx.closePath();
	    } else if (obj.isA == "RoundRect") {
	        radius = obj.w / 20;

	        ctx.beginPath();
	        ctx.roundRect(obj.x, obj.y, obj.w, obj.h, radius);
	        // ctx.rect(obj.x, obj.y, obj.w, obj.h);
	        // ctx.fillStyle = "rgba("+fill_color+",1)";
	        if (obj.alarmExpr.length > 0) {
	            if (evalExpression(obj.alarmExpr) > 0) {
	                ctx.fillStyle = obj.fillStyleAlarm;
	            } else {
	                ctx.fillStyle = obj.fillStyle;
	            }
	        } else {
	            ctx.fillStyle = obj.fillStyle;
	        }
	        ctx.fill();
	        ctx.lineWidth = obj.lineWidth;
	        ctx.strokeStyle = obj.strokeStyle;
	        ctx.stroke();
	        ctx.closePath();
	    } else if (obj.isA == "Bitmap") {
	        ctx.beginPath();
	        ctx.drawImage(obj.img, 0, 0, obj.img.width, obj.img.height, obj.x, obj.y, obj.w, obj.h);
	        ctx.closePath();
	    } else {
            // unknown
	    }
	}

    // sollten wir die Texte auch in die Objects nehmen um die Reichenfolge einzuhalten?
	for (var i in drawTexts) {
		obj = drawTexts[i];

		ctx.beginPath();
		// ctx.font = '8pt Lucida Sans Typewriter';
		ctx.font = obj.fontHeight + 'pt ' + obj.fontName;
		ctx.fillStyle = obj.fillStyle;
		ctx.textAlign = obj.textAlignHorz;
		ctx.textBaseline = obj.textAlignVert;

		var textDisplay = 0;
		if (obj.exprTextDisplay.length > 0) { textDisplay = evalExpression(obj.exprTextDisplay); }
		txt = strformat(obj.format, textDisplay);
		ctx.fillText(txt, obj.x, obj.y);
		ctx.closePath();
	}
}

function update() {
	update_vars();
	draw();
}

