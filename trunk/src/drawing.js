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
var visuCompressed = 0;

var updateInterval = 500;

// performance-Z�hler
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

function switchToVisu(visu) {
	// alle Arrays und Variablenzuordnungen l�schen
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
	var filename = "../PLC/" + visu;
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
// SimpleShape (rectangle, round rect, ellipse)

// constructor
function newSimpleShape(
    shape,
    x,y,w,h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, rightExpr, bottomExpr
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
    this.lineWidth = lineWidth;

    this.alarmExpr = alarmExpr;

    this.leftExpr = leftExpr;
    this.topExpr = topExpr;
    this.rightExpr = rightExpr;
    this.bottomExpr = bottomExpr;
}

function registerSimpleShape(
    shape,
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, rightExpr, bottomExpr
    )
{
    drawObjects.push(new newSimpleShape(
            shape,
            x, y, w, h,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            leftExpr, topExpr, rightExpr, bottomExpr
        ));
}

// ****************************************************************************
// Button

// constructor
function newButton(
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr
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
    this.lineWidth = lineWidth;

    this.alarmExpr = alarmExpr;
}

function registerButton(
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr
    ) {
    drawObjects.push(new newButton(
            x, y, w, h,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr
        ));
}

// ****************************************************************************
// Text

// constructor
function newText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight) {
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
}

function registerText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight) {
	drawTexts.push(new newText(x, y, format, exprTextDisplay, fillStyle, exprTextColor, textAlignHorz, textAlignVert, fontName, fontHeight));
}

// ****************************************************************************
// Bitmap

// constructor
function newBitmap(x, y, w, h, fileName, has_inside_color, fillStyle, fillStyleAlarm, has_frame_color, strokeStyle, strokeStyleAlarm, lineWidth) {
	this.isA = "Bitmap";
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.w = parseInt(w);
	this.h = parseInt(h);
	this.fileName = fileName;
	this.img = new Image();
	this.img.src = '../PLC/' + fileName;

	this.has_inside_color = has_inside_color;
	this.fillStyle = fillStyle;
	this.fillStyleAlarm = fillStyleAlarm;
	this.has_frame_color = has_frame_color;
	this.strokeStyle = strokeStyle;
	this.strokeStyleAlarm = strokeStyleAlarm;
	this.lineWidth = lineWidth;
}

function registerBitmap(x, y, w, h, fileName, has_inside_color, fillStyle, fillStyleAlarm, has_frame_color, strokeStyle, strokeStyleAlarm, line_width) {
    drawObjects.push(new newBitmap(x, y, w, h, fileName, has_inside_color, fillStyle, fillStyleAlarm, has_frame_color, strokeStyle, strokeStyleAlarm, line_width));
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

/* entfernt die Pipe-Zeichen, welche ein Leerzeichen einschlie�en
    ruft sprintf f�r den String auf
*/
function strformat(format, val) {
    format = format.replace(/\| \|/g, ' ');
    if (format.indexOf('%') > -1) {
        format = sprintf(format, val);
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
	perfDisplayStart = new Date().getTime();

	//get a reference to the canvas
	var ctx = $('#canvas')[0].getContext("2d");

	//clear background
	ctx.beginPath();
	ctx.clearRect(0, 0, visuSizeX, visuSizeY);
	ctx.closePath();

	for (var i in drawObjects) {
		obj = drawObjects[i];
		if (obj.isA == "SimpleShape") {
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
		            ctx.rect(obj.x + left, obj.y + top, obj.w + right, obj.h + bottom);
		            break;
		        case 'round-rect':
		            radius = (obj.w + right) / 20;
		            ctx.roundRect(obj.x + left, obj.y + top, obj.w + right, obj.h + bottom, radius);
		            break;
		        case 'circle':
		            ctx.ellipse(obj.x + left, obj.y + top, obj.w + right, obj.h + bottom);
		            break;
		        case 'line':
		            ctx.moveTo(obj.x + left, obj.y + top + obj.h + bottom);
		            ctx.lineTo(obj.x + left + obj.w + right, obj.y + top);
		            break;
		        default:
		            break;
		    }

		    fillStyle = '';
		    strokeStyle = '';

            // determine alarm
		    if (obj.alarmExpr.length > 0) {
		        if (evalExpression(obj.alarmExpr) > 0) {
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
		    ctx.beginPath();
		    try {
		        ctx.drawImage(obj.img, 0, 0, obj.img.width, obj.img.height, obj.x, obj.y, obj.w, obj.h);
		    } catch (e) {
		        console.log("drawImage " + obj.img.src + " error " + e.name);
		    }
		    ctx.rect(obj.x, obj.y, obj.w, obj.h);
		    if (obj.has_frame_color === 'true') {
		        ctx.lineWidth = obj.lineWidth;
		        ctx.strokeStyle = obj.strokeStyle;
		        ctx.stroke();
		    }
		    ctx.closePath();
		} else if (obj.isA == "Button") {
		    ctx.beginPath();

		    ctx.rect(obj.x, obj.y, obj.w, obj.h);

		    fillStyle = '';
		    strokeStyle = '';

		    // determine alarm
		    if (obj.alarmExpr.length > 0) {
		        if (evalExpression(obj.alarmExpr) > 0) {
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

		var textColor = obj.fillStyle;
		if (obj.exprTextColor.length > 0) { textColor = '#' + evalExpression(obj.exprTextColor).toString(16); }

		ctx.fillStyle = textColor;
		ctx.textAlign = obj.textAlignHorz;
		ctx.textBaseline = obj.textAlignVert;

		var textDisplay = 0;
		if (obj.exprTextDisplay.length > 0) { textDisplay = evalExpression(obj.exprTextDisplay); }
		txt = strformat(obj.format, textDisplay);
		ctx.fillText(txt, obj.x, obj.y);
		ctx.closePath();
	}

	// performance-Messungen ausgeben
	if (perfWriteout > 0) {
		perfCount++;

		ctx.beginPath();
		ctx.rect(0, 0, 140, 70);
	    ctx.fillStyle = "rgba(0,0,0,0.4)";
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
	    // ctx.font = '8pt Lucida Sans Typewriter';
		ctx.font = '10pt ';
		ctx.fillStyle = 'rgb(255,255,255)';
		//ctx.fillStyle = 'rgb(128,128,128)';
		//ctx.fillStyle = 'rgb(0,0,0)';
		ctx.textAlign = 'start';
		ctx.textBaseline = 'top';

		ctx.fillText('Perf load ' + perfLoad + 'ms', 5, 5);
		ctx.fillText('Perf update ' + perfUpdate + 'ms (async)', 5, 20);
		ctx.fillText('Perf paint ' + perfDisplay + 'ms', 5, 35);
		ctx.fillText('Perf count ' + perfCount, 5, 50);
		ctx.closePath();
	}

	perfDisplayEnd = new Date().getTime();
	perfDisplay = perfDisplayEnd - perfDisplayStart;
	//console.log("display finished in " + perfDisplay + "ms");
}

function update() {
	update_vars();
	draw();
}

