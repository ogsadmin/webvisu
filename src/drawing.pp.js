// drawing.js

/* TODO:
 - prüfen, ob wir das ständige Repaint nicht vermeiden könnten
 - prüfen, ob wir nicht auf eine objektorientierte (fertige) Render-Engine umsteigen sollten:
   z.B. https://konvajs.github.io/
*/

var visuVariables = {};
var drawObjects = [];
var dynamicTexts = {};

// TODO: alle Klick-Elemente in ein Array zusammenfassen (wegen "verdeckende Elemente")
var clickRegions = [];

var visuName = "";
var visuSizeX = 0;
var visuSizeY = 0;
var visuCompressed = 0;
var visuUseDynamicText = false;
var visuDynTextDefaultLanguage = 'english';

// globale variablen
var updateInterval = 500;
var plcDir = "../PLC";
var startVisu = "plc_visu";

/*
#ifdef USE_STEELSERIES
*/
// steelseries
var steelseriesSupport = false;
var canvObjects = [];
/*
#endif
*/

// performance-Zähler
var perfWriteout = 0;
var perfCount = 0;
var perfLoadStart = 0;
var perfLoadEnd = 0;
var perfLoad = 0;
var perfDisplayStart = 0;
var perfDisplayEnd = 0;
var perfDisplay = 0;
var perfUpdateStart = 0;
var perfUpdateEnd = 0;
var perfUpdate = 0;

// log overlay
var logOverlayWriteout = 0;
var logOverlayText = "LogOverlay:\n";

// use touch instead of mouse-down and -up
var useTouchEvents = ('ontouchstart' in window);


function switchToVisu(visu) {
    // alle Arrays und Variablenzuordnungen löschen
    visuVariables = {};
    drawObjects = [];
    clickRegions = [];

    // TODO: klären, ob jede Visu ihre eigenen DynamicTexts haben kann oder ob es genügen würde
    //       sie nur einmal zu laden.
    visuUseDynamicText = false;
    dynamicTexts = {};

/*
#ifdef USE_STEELSERIES
*/
    for (var i in canvObjects) {
        co = canvObjects[i];
        co.ssobj = null;
        $('#contain')[0].removeChild(co.canvas);
        co.canvas = null;
    }
    canvObjects = [];
/*
#endif
*/


    visuName = "";
    visuSizeX = 0;
    visuSizeY = 0;

    // INIs neu laden
    load_ini(plcDir + "/visu_ini.xml");
    // neue Visu laden
    var filename = plcDir + "/" + visu;
    if (visuCompressed == 1) {
        filename += "_xml.zip";
    } else {
        filename += ".xml";
    }
    load_visu(filename);
}

// ****************************************************************************
// Variables

// constructor
function newVariable(name, addr, value) {
    this.name = name;                         // z.B. ".Ist_Temp_Ki1"
    this.addr = addr;                         // z.B. "4,34175,4,6"
    this.value = value;                       // z.B. ""
    this.addrP = addr.replace(/,/g, '|');     // z.B. "4|34175|4|6"
    var addrFields = addr.split(",");
    this.numBytes = addrFields[2];            // z.B. "4"
    this.varType = parseInt(addrFields[3]);   // z.B. 6
}

function registerVariable(name, addr, value) {
    visuVariables[name] = new newVariable(name, addr, '');
}

// ****************************************************************************
// SimpleShape (rectangle, round rect, ellipse)

// constructor
function newSimpleShape(
    shape,
    x,y,w,h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, rightExpr, bottomExpr,
    invisibleExpr
    )
{
    this.isA = 'SimpleShape';
    this.shape = shape;

    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);

    this.hasInsideColor = hasInsideColor;
    this.fillStyle = fillStyle;
    this.fillStyleAlarm = fillStyleAlarm;

    this.hasFrameColor = hasFrameColor;
    this.strokeStyle = strokeStyle;
    this.strokeStyleAlarm = strokeStyleAlarm;
    this.lineWidth = lineWidth==0 ? 1 : lineWidth;

    this.alarmExpr = alarmExpr;

    this.leftExpr = leftExpr;
    this.topExpr = topExpr;
    this.rightExpr = rightExpr;
    this.bottomExpr = bottomExpr;
    this.invisibleExpr = invisibleExpr;
}

function registerSimpleShape(
    shape,
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, rightExpr, bottomExpr,
    invisibleExpr
    )
{
    drawObjects.push(new newSimpleShape(
            shape,
            x, y, w, h,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            leftExpr, topExpr, rightExpr, bottomExpr,
            invisibleExpr
        ));
}

// ****************************************************************************
// Button

// constructor
function newButton(
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    invisibleExpr,
    bitmapFilename
) {
    this.isA = 'Button';

    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);

    this.hasInsideColor = hasInsideColor;
    this.fillStyle = fillStyle;
    this.fillStyleAlarm = fillStyleAlarm;

    this.hasFrameColor = hasFrameColor;
    this.strokeStyle = strokeStyle;
    this.strokeStyleAlarm = strokeStyleAlarm;
    this.lineWidth = lineWidth==0 ? 1 : lineWidth;

    this.alarmExpr = alarmExpr;
    this.invisibleExpr = invisibleExpr;

    this.bitmapFilename = bitmapFilename;
    this.img = null;
    if (bitmapFilename.length) {
        this.img = new Image();
        this.img.src = plcDir + '/' + bitmapFilename;
    }
}

function registerButton(
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    invisibleExpr,
    bitmapFilename
    ) {
    drawObjects.push(new newButton(
            x, y, w, h,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            invisibleExpr,
            bitmapFilename
        ));
}

// ****************************************************************************
// Text

// constructor
function newText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight, fontWeight, fontItalic, invisibleExpr) {
    this.isA = "Text";
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.format = format;
    this.exprTextDisplay = exprTextDisplay;
    this.fillStyle = fillStyle;
    this.exprTextColor = exprTextColor;
    this.textAlignHorz = textAlignHorz;
    this.textAlignVert = textAlignVert;
    this.fontName = fontName;
    this.fontHeight = fontHeight;
    this.fontWeight = fontWeight;
    this.fontItalic = fontItalic;
    this.invisibleExpr = invisibleExpr;
}

function registerText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight, fontWeight, fontItalic, invisibleExpr) {
    drawObjects.push(new newText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight, fontWeight, fontItalic, invisibleExpr));
}

// ****************************************************************************
// Bitmap

// constructor
function newBitmap(
    x, y, w, h, fileName,
    hasInsideColor, fillStyle, fillStyleAlarm,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    invisibleExpr
    ) {
    this.isA = "Bitmap";
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
    this.fileName = fileName;
    this.img = new Image();
    this.img.src = plcDir + '/' + fileName;

    this.hasInsideColor = hasInsideColor;
    this.fillStyle = fillStyle;
    this.fillStyleAlarm = fillStyleAlarm;
    this.hasFrameColor = hasFrameColor;
    this.strokeStyle = strokeStyle;
    this.strokeStyleAlarm = strokeStyleAlarm;
    this.lineWidth = lineWidth==0 ? 1 : lineWidth;
    this.invisibleExpr = invisibleExpr;
}

function registerBitmap(
    x, y, w, h, fileName,
    hasInsideColor, fillStyle, fillStyleAlarm,
    hasFrameColor, strokeStyle, strokeStyleAlarm, line_width,
    invisibleExpr
    ) {
    drawObjects.push(new newBitmap(x, y, w, h, fileName, hasInsideColor, fillStyle, fillStyleAlarm, hasFrameColor, strokeStyle, strokeStyleAlarm, line_width, invisibleExpr));
}


// ****************************************************************************
// Polygon (polygon, polyline)

// constructor
function newPolygon(
    polyShape,
    points,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr,
    invisibleExpr
    ) {
    this.isA = 'Polygon';
    this.polyShape = polyShape;

    this.points = points;

    this.hasInsideColor = hasInsideColor;
    this.fillStyle = fillStyle;
    this.fillStyleAlarm = fillStyleAlarm;

    this.hasFrameColor = hasFrameColor;
    this.strokeStyle = strokeStyle;
    this.strokeStyleAlarm = strokeStyleAlarm;
    this.lineWidth = lineWidth == 0 ? 1 : lineWidth;

    this.alarmExpr = alarmExpr;

    this.leftExpr = leftExpr;
    this.topExpr = topExpr;
    this.invisibleExpr = invisibleExpr;
}

function registerPolygon(
    polyShape,
    points,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, 
    invisibleExpr
    ) {
    drawObjects.push(new newPolygon(
            polyShape,
            points,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            leftExpr, topExpr,
            invisibleExpr
        ));
}

// ****************************************************************************
// Group

// constructor
function newGroup(
    x, y, w, h
    ) {
    this.isA = 'Group';

    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
}

function registerGroup(
    x, y, w, h
    ) {
    drawObjects.push(new newGroup(
            x, y, w, h
        ));
}

// ****************************************************************************
// EndGroup

// constructor
function newEndGroup(
    ) {
    this.isA = 'EndGroup';
}

function registerEndGroup(
    ) {
    drawObjects.push(new newEndGroup(
        ));
}

/*
#ifdef USE_STEELSERIES
*/

// ****************************************************************************
// SteelSeries

// constructor
function newSteelSeries(
    x, y, w, h,
    object,
    properties,
    exprTextDisplay
    ) {
    this.isA = 'SteelSeries';

    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);

    this.object = object;
    this.properties = properties;

    this.exprTextDisplay = exprTextDisplay;

    this.constructed = false;
}

function registerSteelSeries(
    x, y, w, h,
    object,
    properties,
    exprTextDisplay
    ) {
    drawObjects.push(new newSteelSeries(
            x, y, w, h,
            object,
            properties,
            exprTextDisplay
        ));
}

// constructor
function newCanvObj(canvas, ssobj, exprTextDisplay) {
    this.canvas = canvas;
    this.ssobj = ssobj;
    this.exprTextDisplay = exprTextDisplay;
}

function registerCanvObj(canvas, ssobj, exprTextDisplay) {
    canvObjects.push(new newCanvObj(canvas, ssobj, exprTextDisplay));
}


/*
#endif
*/

// ****************************************************************************
// ClickToggle

// constructor
function newClickToggle(x, y, w, h, variable) {
    this.isA = 'Toggle';
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
    this.variable = variable;
}

function registerClickToggle(x, y, w, h, variable) {
    clickRegions.push(new newClickToggle(x, y, w, h, variable));
}


// ****************************************************************************
// ClickTap

// constructor
function regClickTap(x, y, w, h, variable, newval) {
    this.isA = 'Tap';
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
    this.variable = variable;
    this.newval = newval;
}

function registerClickTap(x, y, w, h, variable, newval) {
    clickRegions.push(new regClickTap(x, y, w, h, variable, newval));
}

// ****************************************************************************
// ClickZoom

// constructor
function regClickZoom(x, y, w, h, visu) {
    this.isA = 'Zoom';
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
    this.visu = visu;
}

function registerClickZoom(x, y, w, h, visu) {
    clickRegions.push(new regClickZoom(x, y, w, h, visu));
}

// ****************************************************************************

/* entfernt die Pipe-Zeichen, welche ein Leerzeichen oder Sonderzeichen einschließen

   falls visuUseDynamicText gesetzt ist ersetzt diese Funktion den dynamic 
   text %<...> im String, falls ein %< vorhanden ist.

   ruft sprintf für den String auf, sofern ein %-Zeichen enthalten ist
*/
function strformat(format, val) {
    // wegen des PreProcessors können wir leider keine /-Syntax für die RegEx nehmen
    format = format.replace(new RegExp('\\| \\|', 'g'), ' ');
    format = format.replace(new RegExp('\\|>\\|', 'g'), '>');
    format = format.replace(new RegExp('\\|<\\|', 'g'), '<');

    if (visuUseDynamicText == true) {
        while (format.indexOf('%<') > -1) {
            //Log("found dynamic text on <" + format + ">");
            var re = new RegExp('%<([^>]+)>', 'g');
            dynTextIds = re.exec(format);
            if (dynTextIds == null) {
                break;
            }
            dynTextId = dynTextIds[1];
            dynTextPlaceholder = '%<' + dynTextId + '>';
            //Log("replace dynamic text <" + dynTextPlaceholder + "> with <" + dynamicTexts[dynTextIds[index]][visuDynTextDefaultLanguage] + ">");
            format = format.replace(dynTextPlaceholder, dynamicTexts[dynTextId][visuDynTextDefaultLanguage]);
        }
    }

    if (format.indexOf('%t') > -1) {
        // #23: spezielle Anforderung: %t will aktuelle PC-Uhrzeit haben
        var now = new Date();
        /* 
        toDateString()  Converts the date portion of a Date object into a readable string
        toGMTString()   Deprecated. Use the toUTCString() method instead
        toISOString()   Returns the date as a string, using the ISO standard
        toJSON()    Returns the date as a string, formatted as a JSON date
        toLocaleDateString()    Returns the date portion of a Date object as a string, using locale conventions
        toLocaleTimeString()    Returns the time portion of a Date object as a string, using locale conventions
        toLocaleString()    Converts a Date object to a string, using locale conventions
        toString()  Converts a Date object to a string
        toTimeString()  Converts the time portion of a Date object to a string
        toUTCString() Converts a Date object to a string, according to universal time
        */
        //format = now.toString();
        format = now.toLocaleDateString() + " " + now.toLocaleTimeString();
    } else {
        if (format.indexOf('%') > -1) {
            format = sprintf(format, val);
        }
    }
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

CanvasRenderingContext2D.prototype.ellipse = function (x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    this.beginPath();
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.closePath();
    this.stroke();
    return this;
}

CanvasRenderingContext2D.prototype.ellipseByCenter = function (cx, cy, w, h) {
    this.ellipse(cx - w / 2.0, cy - h / 2.0, w, h);
    return this;
}


function evalExpression(expr) {
    var result = [];
    //Log("evalExpression");
    for (var i = 0; i < expr.length; i = i + 1) {
        if (expr[i].operation == 'var') {
            //Log("push var " + expr[i].value + " ( " + visuVariables[expr[i].value].value + " ) ");
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

function drawAllObjects(ctx, objects) {
    for (var i in objects) {
        obj = objects[i];
        if (obj.isA == "SimpleShape") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();

            var left = 0;
            if (obj.leftExpr.length > 0) { left = evalExpression(obj.leftExpr); }
            var top = 0;
            if (obj.topExpr.length > 0) { top = evalExpression(obj.topExpr); }
            var right = 0;
            if (obj.rightExpr.length > 0) { right = evalExpression(obj.rightExpr); }
            var bottom = 0;
            if (obj.bottomExpr.length > 0) { bottom = evalExpression(obj.bottomExpr); }

            switch (obj.shape) {
                case 'rectangle':
                    ctx.rect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
                    break;
                case 'round-rect':
                    radius = (obj.w + right - left) / 20;
                    ctx.roundRect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top, radius);
                    break;
                case 'circle':
                    ctx.ellipse(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
                    break;
                case 'line':
                    ctx.moveTo(obj.x + left, obj.y + top + obj.h + bottom - top);
                    ctx.lineTo(obj.x + left + obj.w + right - left, obj.y + top);
                    break;
                default:
                    break;
            }

            fillStyle = obj.fillStyle;
            strokeStyle = obj.strokeStyle;

            // determine alarm
            if (obj.alarmExpr.length > 0) {
                if (evalExpression(obj.alarmExpr) > 0) {
                    fillStyle = obj.fillStyleAlarm;
                    strokeStyle = obj.strokeStyleAlarm;
                }
            }

            // draw fill
            if (obj.hasInsideColor == 'true') {
                ctx.fillStyle = fillStyle;
                ctx.fill();
            }

            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                ctx.stroke();
            }

            ctx.closePath();
        } else if (obj.isA == "Bitmap") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();
            try {
                ctx.drawImage(obj.img, 0, 0, obj.img.width, obj.img.height, obj.x, obj.y, obj.w, obj.h);
            } catch (e) {
                Log("drawImage " + obj.img.src + " error " + e.name);
            }
            ctx.rect(obj.x, obj.y, obj.w, obj.h);
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = obj.strokeStyle;
                ctx.stroke();
            }
            ctx.closePath();
        } else if (obj.isA == "Button") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();

            ctx.rect(obj.x, obj.y, obj.w, obj.h);

            fillStyle = '';
            strokeStyle = '';

            // determine alarm
            isAlarm = false;
            if (obj.alarmExpr.length > 0) {
                if (evalExpression(obj.alarmExpr) > 0) {
                    isAlarm = true;
                    fillStyle = obj.fillStyleAlarm;
                    strokeStyle = obj.strokeStyleAlarm;
                } else {
                    fillStyle = obj.fillStyle;
                    strokeStyle = obj.strokeStyle;
                }
            } else {
                fillStyle = obj.fillStyle;
                strokeStyle = obj.strokeStyle;
            }

            // #22: draw bitmap (if any)
            if (obj.bitmapFilename.length) {
                //Log("drawImage " + obj.bitmapFilename);
                try {
                    ctx.drawImage(obj.img, 0, 0, obj.img.width, obj.img.height, obj.x, obj.y, obj.w, obj.h);
                } catch (e) {
                    Log("drawImage " + obj.img.src + " error " + e.name);
                }
            } else {
                // draw fill - only if no bitmap is active
                if (obj.hasInsideColor == 'true') {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
            }
            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                ctx.stroke();
            }

            ctx.closePath();

            // draw button frame :-)
            abstand = 2;
            strokeStyle1 = 'rgba(0,0,0,0.5)';
            strokeStyle2 = 'rgba(255,255,255,0.5)';
            if (isAlarm == true) {
                strokeStyle2 = 'rgba(0,0,0,0.5)';
                strokeStyle1 = 'rgba(255,255,255,0.5)';
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            // Rand rechts unten
            ctx.strokeStyle = strokeStyle1;
            ctx.moveTo(obj.x + abstand, obj.y + obj.h - abstand);
            ctx.lineTo(obj.x + obj.w - abstand, obj.y + obj.h - abstand);
            ctx.lineTo(obj.x + obj.w - abstand, obj.y + abstand);
            ctx.stroke();
            ctx.closePath();
            // Rand links oben
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = strokeStyle2;
            ctx.moveTo(obj.x + obj.w - abstand, obj.y + abstand);
            ctx.lineTo(obj.x + abstand, obj.y + abstand);
            ctx.lineTo(obj.x + abstand, obj.y + obj.h - abstand);
            ctx.stroke();
            ctx.closePath();
        } else if (obj.isA == "Polygon") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();

            var left = 0;
            if (obj.leftExpr.length > 0) { left = evalExpression(obj.leftExpr); }
            var top = 0;
            if (obj.topExpr.length > 0) { top = evalExpression(obj.topExpr); }

            var first = true;
            var firstPointFields = [];
            for (var i in obj.points) {
                point = obj.points[i];
                var pointFields = point.split(',');
                x = parseInt(pointFields[0]);
                y = parseInt(pointFields[1]);

                if (first) {
                    firstPointFields = pointFields;
                    ctx.moveTo(x + left, y + top);
                    first = false;
                } else {
                    ctx.lineTo(x + left, y + top);
                }
            }

            // ein polygon ist geschlossen, eine polyline nicht...
            if (obj.polyShape == 'polygon') {
                x = parseInt(firstPointFields[0]);
                y = parseInt(firstPointFields[1]);
                ctx.lineTo(x + left, y + top);
            }

            fillStyle = obj.fillStyle;
            strokeStyle = obj.strokeStyle;

            // determine alarm
            if (obj.alarmExpr.length > 0) {
                if (evalExpression(obj.alarmExpr) > 0) {
                    fillStyle = obj.fillStyleAlarm;
                    strokeStyle = obj.strokeStyleAlarm;
                }
            }

            // Füllung beachten wir nur bei geschlossenen Polygonen
            if (obj.polyShape == 'polygon') {
                // draw fill
                if (obj.hasInsideColor == 'true') {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
            }

            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                ctx.stroke();
            }

            ctx.closePath();
        } else if (obj.isA == "Text") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();

            // ctx.font = '8pt Lucida Sans Typewriter';

            var font = '';
            if (obj.fontItalic == 'true') {
                font += 'italic ';
            } else {
                font += 'normal ';
            }

            if (parseInt(obj.fontWeight) != 0) {
                //font += parseInt(parseFloat(obj.fontWeight) / 1.75) + ' ';
                fontWeight = parseInt(obj.fontWeight);
                if (fontWeight == 700) {
                    font += 'bold ';
                } else {
                    font += 'normal ';
                }
            } else {
                font += 'normal ';
            }

            var fontHeight = 0;
            if (parseInt(obj.fontHeight) != 0) {
                var fontHeight = parseFloat(obj.fontHeight);
                if (fontHeight < 0)
                    fontHeight = 0 - fontHeight;
                //fontHeight = fontHeight / 1.75;
                font += parseInt(fontHeight) + 'px ';
            } else {
                font += '9px ';
            }

            if (obj.fontName != '') {
                font += obj.fontName + ' ';
            } else {
                font += 'Lucida Sans Typewriter ';
            }

            //Log('set font to <' + font + '>');
            ctx.font = font;

            var textColor = obj.fillStyle;
            if (obj.exprTextColor.length > 0) { textColor = '#' + evalExpression(obj.exprTextColor).toString(16); }

            ctx.fillStyle = textColor;
            ctx.textAlign = obj.textAlignHorz;
            ctx.textBaseline = obj.textAlignVert;

            var textDisplay = 0;
            if (obj.exprTextDisplay.length > 0) { textDisplay = evalExpression(obj.exprTextDisplay); }
            txt = strformat(obj.format, textDisplay);
            //Log('write text <' + txt + '>');

            // multiline? Dann mehrere Texte schreiben
            if (txt.indexOf('\n') > -1) {
                txt = txt.replace(new RegExp('\\r', 'g'), '');
                txt = txt.trim();
                var lines = txt.split('\n');
                var myY = obj.y;

                if (obj.textAlignVert == 'bottom') {
                    myY = myY - (lines.length * fontHeight);
                } else if (obj.textAlignVert == 'middle') {
                    myY = myY - ((lines.length - 1) * fontHeight / 2);
                } else { /* top */
                    /* do nothing */
                }

                for (var i in lines) {
                    var line = lines[i];

                    ctx.fillText(line, obj.x, myY);

                    myY = myY + fontHeight;
                }
            } else {
                ctx.fillText(txt, obj.x, obj.y);
            }

            ctx.closePath();
        } else if (obj.isA == "Group") {
            ctx.save();
            ctx.translate(obj.x, obj.y);
        } else if (obj.isA == "EndGroup") {
            ctx.restore();
/*
#ifdef USE_STEELSERIES
*/
        } else if (obj.isA == "SteelSeries") {
            if (obj.constructed == false) {
                obj.constructed = true;
                var canvas = document.createElement("canvas");
                canvas.id = "sscanvas";
                canvas.style.zIndex = 8;
                canvas.style.top = obj.y + "px";
                canvas.style.left = obj.x + "px";
                canvas.style.position = "absolute";
                //canvas.style.border = "1px solid";

                //document.body.appendChild(obj.canvas);
                $('#contain')[0].appendChild(canvas);

                var evalString = '\
                    var ssobj = new steelseries.'
                    + obj.object
                    + '(canvas, {\
                        size: obj.w,\
                        width: parseInt(obj.w),\
                        height: parseInt(obj.h),'
                    + obj.properties
                    + '});'

                //Log("evalString: <" + evalString + ">");

                eval(evalString);

                registerCanvObj(canvas, ssobj, obj.exprTextDisplay);
            }
/*
#endif
*/
        } else {
            // unknown
        }
    }
}

function draw() {
    perfDisplayStart = new Date().getTime();

    //get a reference to the canvas
    var ctx = $('#canvas')[0].getContext("2d");

    //clear background
    ctx.beginPath();
    ctx.clearRect(0, 0, visuSizeX, visuSizeY);
    ctx.closePath();

    drawAllObjects(ctx, drawObjects);

    // performance-Messungen ausgeben
    if (perfWriteout > 0) {
        perfCount++;

        ctx.beginPath();
        ctx.rect(0, 0, 140, 70);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '10pt ';
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';

        ctx.fillText('Perf load ' + perfLoad + 'ms', 5, 5);
        ctx.fillText('Perf update ' + perfUpdate + 'ms (async)', 5, 20);
        ctx.fillText('Perf paint ' + perfDisplay + 'ms', 5, 35);
        ctx.fillText('Perf count ' + perfCount, 5, 50);
        ctx.closePath();
    }

    if (logOverlayWriteout > 0) {
        ctx.beginPath();
        ctx.rect(visuSizeX-200, 0, visuSizeX, 140);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = '10pt ';
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';

        var myText = logOverlayText;
        var myFontHeight = 13;
        var myX = visuSizeX - 200 + 5;
        // multiline? Dann mehrere Texte schreiben
        if (myText.indexOf('\n') > -1) {
            // myText = myText.replace(new RegExp('\\r', 'g'), '');
            // myText = myText.trim();
            var lines = myText.split('\n');
            var myY = 5;
            var newText = '';
            var iStart = 0;
            var iEnd = lines.length - 1;
            if (iEnd > 10) {
                iStart = iEnd - 10;
            }
            for (var i = iStart; i < iEnd; i++) {
            //for (var i in lines) {
                var line = lines[i];
                ctx.fillText(line, myX, myY);
                myY = myY + myFontHeight;
                newText += line + "\n";
            }
            logOverlayText = newText;
        } else {
            ctx.fillText(myText, myX, 5);
        }

        ctx.closePath();
    }

    perfDisplayEnd = new Date().getTime();
    perfDisplay = perfDisplayEnd - perfDisplayStart;
    //Log("display finished in " + perfDisplay + "ms");
}

function update() {
    update_vars();
    draw();
}

