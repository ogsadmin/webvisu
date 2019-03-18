// drawing.js

/* TODO:
 - prüfen, ob wir das ständige Repaint nicht vermeiden könnten
 - prüfen, ob wir nicht auf eine objektorientierte (fertige) Render-Engine umsteigen sollten:
   z.B. https://konvajs.github.io/
*/

var visuVariables = {};
var drawObjects = [];
var dynamicTexts = {};

// Klick-Kontext
var clickCanvas = null;
var clickContext = null;
// Dict (objID -> "ARRAY von Actions")
var clickObject = {};

// Variablen, welche aus der Visu-XML gefüllt werden
var visuName = "";
var visuSizeX = 0;
var visuSizeY = 0;

var currentVisuLoaded = "";

var visuCompressed = 0;
var visuUseDynamicText = false;
var visuDynTextDefaultLanguage = 'english';
var visuBestFit = false;

// globale variablen
var updateInterval = 500;
var updateIntervalId;
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

// performance-Zaehler
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

var errorCountdown = 0;

function errorCountdownUpdate()
{
    var errorcountdown = document.getElementById("errorcountdown");
    errorcountdown.innerHTML = errorCountdown;

    if(errorCountdown<1) {
        switchToVisu(currentVisuLoaded);
        updateIntervalId = setInterval(update, updateInterval);
    } else {
        errorCountdown--;
        setTimeout(errorCountdownUpdate, 1000);
    }
}

function errorStateEnable()
{
    // ERROR-Overlay anzeigen
	var errorcontainer = document.getElementById("errorcontainer");
    errorcontainer.style.display = "block";

    // zyklischen Update stoppen
    // dürfte wegen der Zeitüberschreitung aber ohnehin schon vom Browser
    // gestoppt sein.
    clearInterval(updateIntervalId);

    // wir versuchen automatisch alle 10 Sekunden wieder neu zu starten
    errorCountdown = 10;
    errorCountdownUpdate();
}

function switchToVisu(visu) {
    // alle Arrays und Variablenzuordnungen löschen
    visuVariables = {};
    drawObjects = [];
    clickObject = {};

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

    currentVisuLoaded = visu;

    // INIs neu laden
    load_ini(plcDir + "/visu_ini.xml");

    // neue Visu laden
    var filename = getVisuFileName(visu);
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
    invisibleExpr,
    frameFlagsExpr
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
    this.frameFlagsExpr = frameFlagsExpr;
}

function registerSimpleShape(
    shape,
    x, y, w, h,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, rightExpr, bottomExpr,
    invisibleExpr,
    frameFlagsExpr
    )
{
    drawObjects.push(new newSimpleShape(
            shape,
            x, y, w, h,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            leftExpr, topExpr, rightExpr, bottomExpr,
            invisibleExpr,
            frameFlagsExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerSimpleShape return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
        this.img.src = getFileName(plcDir + '/' + bitmapFilename);
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
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerButton return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerText return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
    this.img.src = getFileName(plcDir + '/' + fileName);

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
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerBitmap return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
    invisibleExpr,
    frameFlagsExpr
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
    this.frameFlagsExpr = frameFlagsExpr;
}

function registerPolygon(
    polyShape,
    points,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    alarmExpr,
    leftExpr, topExpr, 
    invisibleExpr,
    frameFlagsExpr
    ) {
    drawObjects.push(new newPolygon(
            polyShape,
            points,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            alarmExpr,
            leftExpr, topExpr,
            invisibleExpr,
            frameFlagsExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerPolygon return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// Piechart

// constructor
function newPiechart(
    polyShape,
    points,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    onlyShowArc,
    alarmExpr,
    leftExpr, topExpr,
    invisibleExpr,
    frameFlagsExpr,
    angle1Expr, angle2Expr
    ) {
    this.isA = 'Piechart';
    this.polyShape = polyShape;

    this.points = points;

    this.hasInsideColor = hasInsideColor;
    this.fillStyle = fillStyle;
    this.fillStyleAlarm = fillStyleAlarm;

    this.hasFrameColor = hasFrameColor;
    this.strokeStyle = strokeStyle;
    this.strokeStyleAlarm = strokeStyleAlarm;
    this.lineWidth = lineWidth == 0 ? 1 : lineWidth;

    this.onlyShowArc = onlyShowArc;

    this.alarmExpr = alarmExpr;

    this.leftExpr = leftExpr;
    this.topExpr = topExpr;
    this.invisibleExpr = invisibleExpr;

    this.frameFlagsExpr = frameFlagsExpr;

    this.angle1Expr = angle1Expr;
    this.angle2Expr = angle2Expr;
}

function registerPiechart(
    polyShape,
    points,
    hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
    hasInsideColor, fillStyle, fillStyleAlarm,
    onlyShowArc,
    alarmExpr,
    leftExpr, topExpr, 
    invisibleExpr, 
    frameFlagsExpr,
    angle1Expr, angle2Expr
    ) {
    drawObjects.push(new newPiechart(
            polyShape,
            points,
            hasFrameColor, strokeStyle, strokeStyleAlarm, lineWidth,
            hasInsideColor, fillStyle, fillStyleAlarm,
            onlyShowArc,
            alarmExpr,
            leftExpr, topExpr,
            invisibleExpr,
            frameFlagsExpr,
            angle1Expr, angle2Expr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerPiechart return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// Scrollbar Slider

// constructor
function newScrollbarSlider(
    x, y, w,
    sliderAreaWidth, sliderAreaHeight,
    isHorizontal,
    lowerBoundExpr, upperBoundExpr,
    tapVarExpr,
    invisibleExpr,
    usedForSubvisu,
    lowerBound,
    upperBound,
    sliderValue
    ) {
    this.isA = 'ScrollbarSlider';

    this.x = x;
    this.y = y;
    this.w = w;
    this.sliderAreaWidth = sliderAreaWidth;
    this.sliderAreaHeight = sliderAreaHeight;
    this.isHorizontal = isHorizontal;
    this.lowerBoundExpr = lowerBoundExpr;
    this.upperBoundExpr = upperBoundExpr;
    this.tapVarExpr = tapVarExpr;
    this.invisibleExpr = invisibleExpr;
    this.usedForSubvisu = usedForSubvisu;

    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.sliderValue = sliderValue;
}

function registerScrollbarSlider(
    x, y, w,
    sliderAreaWidth, sliderAreaHeight,
    isHorizontal,
    lowerBoundExpr, upperBoundExpr,
    tapVarExpr,
    invisibleExpr = [],
    usedForSubvisu = false,  // if used for subvisu, the following values are used instead of lowerBoundExpr, upperBoundExpr and tapVarExpr
    lowerBound = 0,
    upperBound = 0,
    sliderValue = 0
    ) {
    drawObjects.push(new newScrollbarSlider(
        x, y, w,
        sliderAreaWidth, sliderAreaHeight,
        isHorizontal,
        lowerBoundExpr, upperBoundExpr,
        tapVarExpr,
        invisibleExpr,
        usedForSubvisu,
        lowerBound,
        upperBound,
        sliderValue
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// Scrollbar Arrow

// constructor
function newScrollbarArrow(
    x, y, 
    width, height,
    direction,
    invisibleExpr
    ) {
    this.isA = 'ScrollbarArrow';

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = direction;

    this.invisibleExpr = invisibleExpr;
}

function registerScrollbarArrow(
    x, y, 
    width, height,
    direction,
    invisibleExpr
    ) {
    drawObjects.push(new newScrollbarArrow(
        x, y,
        width, height,
        direction,
        invisibleExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// Subvisu

// constructor
function newSubvisu(
    rectFields,
    clipFrame, 
    fixedFrame, fixedFrameScrollable, scaleIsotropic,
    invisibleExpr
    ) {
    this.isA = 'Subvisu';

    this.rectFields = rectFields;
    this.clipFrame = clipFrame;
    this.fixedFrame = fixedFrame;
    this.fixedFrameScrollable = fixedFrameScrollable;
    this.scaleIsotropic = scaleIsotropic;

    this.invisibleExpr = invisibleExpr;
}

function registerSubvisu(
    rectFields,
    clipFrame,
    fixedFrame, fixedFrameScrollable, scaleIsotropic,
    invisibleExpr
    ) {
    drawObjects.push(new newSubvisu(
        rectFields,
        clipFrame,
        fixedFrame, fixedFrameScrollable, scaleIsotropic,
        invisibleExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

function addSubvisuParams(
        subvisuSize
    ) {
        lastElement = drawObjects.pop(); 
        if (!(lastElement.isA == "Subvisu")) {
            drawObjects.push(lastElement);
            Log("wrong use of 'addSubvisuParams'-Function, must be after 'registerSubvisu'");
            return;
        }
        lastElement.subvisuSize = subvisuSize;
        drawObjects.push(lastElement);
}

// ****************************************************************************
// EndSubvisu

// constructor
function newEndSubvisu(
    rectFields,
    showFrame, frameColor,
    lineWidth,
    invisibleExpr
    ) {
    this.isA = 'EndSubvisu';

    this.rectFields = rectFields;
    this.showFrame = showFrame;
    this.frameColor = frameColor;
    this.lineWidth = lineWidth;

    this.invisibleExpr = invisibleExpr;
}

function registerEndSubvisu(
    rectFields,
    showFrame, frameColor,
    lineWidth,
    invisibleExpr
    ) {
    drawObjects.push(new newEndSubvisu(
        rectFields,
        showFrame, frameColor,
        lineWidth,
        invisibleExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// Placeholder

// constructor
function newNotImplemented(
    rectFields,
    invisibleExpr
    ) {
    this.isA = 'NotImplemented';

    this.rectFields = rectFields;
    this.invisibleExpr = invisibleExpr;
}

function registerNotImplemented(
    rectFields,
    invisibleExpr
    ) {
    drawObjects.push(new newNotImplemented(
        rectFields,
        invisibleExpr
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
}

// ****************************************************************************
// EndGroup

// constructor
function newEndGroup(
    ) {
    this.isA = 'EndGroup';
}

function registerEndGroup() {
    drawObjects.push(new newEndGroup(
        ));
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerEndGroup return "+(drawObjects.length-1))
    return drawObjects.length-1;
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
    // Gib die ID (den Index) des eben registrierten Objekts zurück
    //Log("registerSteelSeries return "+(drawObjects.length-1))
    return drawObjects.length-1;
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


function registerSubvisuScrollbar(subvisuId)
{
    var subvisu = drawObjects[subvisuId];
    if (!subvisu.scrollbarSliderIds)
    {
        subvisu.scrollbarSliderIds = [];
    }
    var rectFields = drawObjects[subvisuId].rectFields;

    var scrollbarsToDraw = [];

    // check which scrollbars have to be drawn
    if ( (subvisu.subvisuSize[0] - (rectFields[2] - rectFields[0])) > 0 ) {
        scrollbarsToDraw.push("horizontal");
    }
    if ( (subvisu.subvisuSize[1] - (rectFields[3] - rectFields[1])) > 0 ) {
        scrollbarsToDraw.push("vertical");
    }

    // if both scrollbars are needed, draw gray square in the corner too
    drawBothScrollbars = (scrollbarsToDraw.length >= 2);
    if (drawBothScrollbars) {
        scrollbarsToDraw.push("corner");
    }

	scrollbarsToDraw.forEach(function(orientation) {
		if(orientation == "corner") {
            // draw gray square in bottom right corner
			var rectFieldsScrollbar = [
				rectFields[2] - SUBVISU_SCROLLBAR_WIDTH,
				rectFields[3] - SUBVISU_SCROLLBAR_WIDTH,
				rectFields[2],
				rectFields[3]
			];
			registerScrollbarRect(rectFieldsScrollbar, subvisu.invisibleExpr);
			return;
		} else if(orientation == "horizontal") {
            // draw horizontal scrollbar
			var rectFieldsScrollbar = [
				rectFields[0],
				rectFields[3] - ((drawBothScrollbars)?SUBVISU_SCROLLBAR_WIDTH:0),
				rectFields[2] - SUBVISU_SCROLLBAR_WIDTH,
				rectFields[3]
			];
		} else {
            // draw vertical scrollbar
			var rectFieldsScrollbar = [
				rectFields[2] - SUBVISU_SCROLLBAR_WIDTH,
				rectFields[1],
				rectFields[2],
				rectFields[3] - ((drawBothScrollbars)?SUBVISU_SCROLLBAR_WIDTH:0)
			];
		}
		registerScrollbarRect(rectFieldsScrollbar, subvisu.invisibleExpr);
		var x1 = rectFieldsScrollbar[0];
		var y1 = rectFieldsScrollbar[1];
		var x2 = rectFieldsScrollbar[2];
		var y2 = rectFieldsScrollbar[3];

		var isHorizontal = ( orientation == "horizontal" );

		var arrowboxDimensions = calcArrowboxDimensions(x2-x1, y2-y1);
        
        // scrollbar changes value between 0 and the pixel-difference between subvisu-element-size (minus scrollbar-width) and subvisu-size
		var lowerBound = 0;
		if (isHorizontal) {
			var sliderWidth = arrowboxDimensions[0] / 2;
			var xSliderArea = x1 + arrowboxDimensions[0];
			var ySliderArea = y1;
			var sliderAreaWidth = x2 - x1 - 2 * arrowboxDimensions[0] - sliderWidth;
			var sliderAreaHeight = y2 - y1;
			var upperBound = subvisu.subvisuSize[0] - (rectFields[2] - rectFields[0]) + ((drawBothScrollbars)?SUBVISU_SCROLLBAR_WIDTH:0);
		} else {
			var sliderWidth = arrowboxDimensions[1] / 2;
			var xSliderArea = x1;
			var ySliderArea = y1 + arrowboxDimensions[1];
			var sliderAreaWidth = y2 - y1 - 2 * arrowboxDimensions[1] - sliderWidth;
			var sliderAreaHeight = x2 - x1;
			var upperBound = subvisu.subvisuSize[1] - (rectFields[3] - rectFields[1]) + ((drawBothScrollbars)?SUBVISU_SCROLLBAR_WIDTH:0);
        }
        
        if (upperBound < 0) {
            upperBound = 0;
        }

		if (!isHorizontal) {
			var buffer = lowerBound;
			lowerBound = upperBound;
			upperBound = buffer;
		}		

		sliderId = registerScrollbarSlider(
			xSliderArea, ySliderArea,
			sliderWidth,
			sliderAreaWidth, sliderAreaHeight,
			isHorizontal,
			emptyExpr, emptyExpr,
			emptyExpr,
			subvisu.invisibleExpr,
			true,
			lowerBound, upperBound
		);

		registerClickObj_Slider(
			sliderId, 
			emptyExpr, 
			isHorizontal, 
			sliderAreaWidth,
			emptyExpr, 
			emptyExpr,
			true
		);

		objId = registerScrollbarArrow(
			x1, y1, 
			arrowboxDimensions[0], arrowboxDimensions[1],
			(isHorizontal)?"left":"up",
			subvisu.invisibleExpr
		);

		registerClickObj_IncDec(
			objId, 
			emptyExpr, 
			!isHorizontal, 
			emptyExpr, 
			emptyExpr,
			sliderId
		);

		var x1Arrow, y1Arrow;
		if (isHorizontal) {
			x1Arrow = x2 - arrowboxDimensions[0];
			y1Arrow = y1;
		} else {
			x1Arrow = x1;
			y1Arrow = y2 - arrowboxDimensions[1];
		}

		objId = registerScrollbarArrow(
			x1Arrow, y1Arrow,
			arrowboxDimensions[0], arrowboxDimensions[1],
			(isHorizontal)?"right":"down",
			subvisu.invisibleExpr
		);

		registerClickObj_IncDec(
			objId, 
			emptyExpr, 
			isHorizontal, 
			emptyExpr, 
			emptyExpr,
			sliderId
		);
		subvisu.scrollbarSliderIds[(isHorizontal)?"horizontal":"vertical"] = sliderId;

	});
				
}

function registerScrollbarRect(rectFields, exprInvisible = []) {
    // just to make things simpler: most of the parameters of rectangles used as part of a scrollbar
    //      are always the same, only position and size varies
	var has_frame_color = "false";
	var frame_color = "0,0,0";
	var frame_color_alarm = "0,0,0";
	var line_width = "0";
	var has_inside_color = "true";
	var fill_color = "220,220,220";
	var fill_color_alarm = "0,0,0";
	var exprToggleColor = [];
	var exprLeft = [];
	var exprTop = [];
	var exprRight = [];
	var exprBottom = [];
	var exprFrameFlags = [];

	var objId = registerSimpleShape(
		"rectangle",
		rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
		has_frame_color,
		"rgb(" + frame_color + ")",
		"rgb(" + frame_color_alarm + ")",
		line_width,
		has_inside_color,
		"rgb(" + fill_color + ")",
		"rgb(" + fill_color_alarm + ")",
		exprToggleColor,
		exprLeft, exprTop, exprRight, exprBottom,
		exprInvisible,
		exprFrameFlags
		);
}


/*
#endif
*/

// ****************************************************************************
// ClickToggle

// constructor
function clickObj_Toggle(variable) {
    this.isA = 'Toggle';
    this.variable = variable;
}

function registerClickObj_Toggle(objId, variable) {
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Toggle(variable));
}

// ****************************************************************************
// ClickTap

// constructor
function clickObj_Tap(variable, newval) {
    this.isA = 'Tap';
    this.variable = variable;
    this.newval = newval;
}

function registerClickObj_Tap(objId, variable, newval) {
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Tap(variable, newval));
}

// ****************************************************************************
// ClickZoom

// constructor
function clickObj_Zoom(exprZoom) {
    this.isA = 'Zoom';
    this.exprZoom = exprZoom;
}

function registerClickObj_Zoom(objId, exprZoom) {
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Zoom(exprZoom));
}

// ****************************************************************************
// ClickEdit

// constructor
function clickObj_Edit(x, y, w, h, variable) {
    this.isA = 'Edit';
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
    this.variable = variable;
}

function registerClickObj_Edit(objId, x, y, w, h, variable) {
    //Log("registerClickObj_Edit("+objId+",...)");
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Edit(x, y, w, h, variable));
}

// ****************************************************************************
// ClickAction

// constructor
function clickObj_Action(variable, newvalExpr) {
    this.isA = 'Action';
    this.variable = variable;
    this.newvalExpr = newvalExpr;
}

function registerClickObj_Action(objId, variable, newvalExpr) {
    //Log("registerClickObj_Action("+objId+",...)");
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Action(variable, newvalExpr));
}

// ****************************************************************************
// Click Increase/Decrease

// constructor
function clickObj_IncDec(variable, increase, minValExpr, maxValExpr, objId, sliderId) {
    this.isA = 'IncDec';
    this.variable = variable;
    this.increase = increase;

    this.minValExpr = minValExpr;
    this.maxValExpr = maxValExpr;

    this.objId = objId;
    this.sliderId = sliderId;
}

function registerClickObj_IncDec(objId, variable, increase, minValExpr, maxValExpr, sliderId = -1) {
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_IncDec(variable, increase, minValExpr, maxValExpr, objId, sliderId));
}

// ****************************************************************************
// Click Slider

// constructor
function clickObj_Slider(variable, horizontal, sliderLen, minValExpr, maxValExpr, sliderId, isSubvisuScrollbar) {
    this.isA = 'Slider';
    this.variable = variable;
    this.horizontal = horizontal;

    this.sliderLen = sliderLen;

    this.minValExpr = minValExpr;
    this.maxValExpr = maxValExpr;

    // sliderId is needed when it's a scrollbar for a scrollable subvisu
    // -1 indicates that it is not
    this.sliderId = (isSubvisuScrollbar)?sliderId:-1;
}

function registerClickObj_Slider(objId, variable, horizontal, sliderLen, minValExpr, maxValExpr, isSubvisuScrollbar = false) {
    if(!(objId in clickObject)) {
        clickObject[objId] = []; // Array von Klick-Info
    }
    clickObject[objId].push(new clickObj_Slider(variable, horizontal, sliderLen, minValExpr, maxValExpr, objId, isSubvisuScrollbar));
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
            // Log("found dynamic text on <" + format + ">");
            var re = new RegExp('%<([^>]+)>', 'g');
            dynTextIds = re.exec(format);
            if (dynTextIds == null) {
                Log("ERROR: dynTextIds == null")
                break;
            }
            dynTextId = dynTextIds[1];
            dynTextPlaceholder = '%<' + dynTextId + '>';
            dynTextKey = dynTextId + "_" + val;
            if (dynTextKey in dynamicTexts) {
                format = format.replace(dynTextPlaceholder, dynamicTexts[dynTextKey][visuDynTextDefaultLanguage]);
            } else {
                format = format.replace(dynTextPlaceholder, dynTextKey);
            }
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

/*  scrollbar helper function, calculates width and height of the arrow boxes at the ends,
    depending on the dimensions of the scrollbar */
function calcArrowboxDimensions(scrollbarWidth, scrollbarHeight) {    
    var arrowBoxDimensions = [];
    var isHorizontalScrollbar = (scrollbarWidth > scrollbarHeight);
    if (isHorizontalScrollbar) {
        arrowBoxDimensions[1] = scrollbarHeight;

        if (scrollbarWidth >= 4 * scrollbarHeight) {
            // in this case the arrowBox is quadratic
            arrowBoxDimensions[0] = arrowBoxDimensions[1];
        } else {
            arrowBoxDimensions[0] = scrollbarWidth/4;
        }

    } else {
        arrowBoxDimensions[0] = scrollbarWidth;

        if (scrollbarHeight >= 4 * scrollbarWidth) {
            arrowBoxDimensions[1] = arrowBoxDimensions[0];
        } else {
            arrowBoxDimensions[1] = scrollbarHeight/4;
        }
    }
    return arrowBoxDimensions;
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

CanvasRenderingContext2D.prototype.ellipseArc = function (x, y, radiusx, radiusy, startAngle, endAngle, anticlockwise) {
    var yScaleFactor = radiusy/radiusx;

    this.beginPath();

    this.save();
    this.scale(1, yScaleFactor);
    this.arc(x, y * 1/yScaleFactor, radiusx, startAngle, endAngle, anticlockwise);
    this.restore(); 
    return this;
}

CanvasRenderingContext2D.prototype.ellipseSector = function (x, y, radiusx, radiusy, startAngle, endAngle, anticlockwise) {
    var yScaleFactor = radiusy/radiusx,
        yAbsolute = y * 1 / yScaleFactor;

    this.beginPath();
    this.moveTo(x,y);

    this.save();

    this.scale(1, yScaleFactor);
    this.arc(x, yAbsolute, radiusx, startAngle, endAngle, anticlockwise);
    this.lineTo(x,yAbsolute);

    this.restore(); 

    return this;
}
CanvasRenderingContext2D.prototype.arrowboxTriangle = function(rectX1, rectY1, rectX2, rectY2, direction, color) {
    // draws an isosceles triangle from the minimal bounding rectangle and 
    // the direction in which the arrow should point
    var width = rectX2 - rectX1;
    var height = rectY2 - rectY1;
    var x1, y1, x2, y2, x3, y3;
    switch (direction) {
        case "up":
            x1 = rectX1;
            y1 = rectY2;
            x2 = rectX1 + width/2;
            y2 = rectY1;
            x3 = rectX2;
            y3 = rectY2;
            break;
        case "down":
            x1 = rectX1;
            y1 = rectY1;
            x2 = rectX2;
            y2 = rectY1;
            x3 = rectX1 + width/2;
            y3 = rectY2;
            break;
        case "left":
            x1 = rectX2;
            y1 = rectY1;
            x2 = rectX2;
            y2 = rectY2;
            x3 = rectX1;
            y3 = rectY1 + height/2;
            break;
        case "right":
            x1 = rectX1;
            y1 = rectY1;
            x2 = rectX2;
            y2 = rectY1 + height/2;
            x3 = rectX1;
            y3 = rectY2;
            break;
        default:
            x1 = 0;
            y1 = 0;
            x2 = 0;
            y2 = 0;
            x3 = 0;
            y3 = 0;
            break;
    }
    
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.lineTo(x3, y3);
    this.lineTo(x1, y1);
    this.fillStyle = color;
    this.fill();
    this.closePath();
}

// Klick-Kontext Helper

/* Achtung: 
   Laut HTML5 müssen Browser die Image-Daten "unpremultiplied" verwalten.
   Einige alte Browser nutzen jedoch zur Beschleunigung "premultiplied" Daten.
   Das kann zu Farbveränderungen führen und damit könnte es sein, dass dieser
   Mechanismus der Klick-Erkennung nicht mehr funktioniert.
   Allerdings würde (normalerweise) lediglich der Alpha-Kanal in die Farb-
   veränderung einwirken. Diesen setzen wir (implizit) auf 255, wodurch auch 
   bei fehlerhaften Browsern kein Problem auftreten sollte.
*/

// Konvertiert einen 24-Bit-Integer in einen Farbwert ('#123456')
function decimalToColorString(number) {
    ret = parseInt(number).toString(16);
    while (ret.length < 6) {
        ret = "0" + ret;
    }
    //Log("decimalToColorString("+number+") => "+ret);
    return "#"+ret;
}

// Expression Helper

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
            if(expr[i].count == 0) {
                // expr ohne count
                if (expr[i].value == 'NOT') {
                    var v1 = result.pop();
                    result.push( !v1 );
                } else if (expr[i].value == 'XOR') {
                    var v1 = result.pop();
                    var v2 = result.pop();
                    result.push(v2 ^ v1);
                } else {
                    Log("error: expression operation < " + expr[i].operation + " > value < " + expr[i].value + " > unknown");
                }
            } else {
                // expr mit count
                for (c = 1; c < expr[i].count; c++) {
                    if (expr[i].value == 'OR') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 || v1);
                    } else if (expr[i].value == 'AND') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 && v1);
                    } else if (expr[i].value == 'MOD') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 % v1);
                    } else if (expr[i].value == '/') {
                        // TODO: kann das so stimmen?
                        //       a / b ist nicht b / a
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 / v1);
                    } else if (expr[i].value == '*') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 * v1);
                    } else if (expr[i].value == '+') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 + v1);
                    } else if (expr[i].value == '-') {
                        // TODO: kann das so stimmen?
                        //       a - b ist nicht b - a
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 - v1);
                    } else if (expr[i].value == '>') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 > v1);
                    } else if (expr[i].value == '<') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 < v1);
                    } else if (expr[i].value == '<=') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 <= v1);
                    } else if (expr[i].value == '>=') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 >= v1);
                    } else if (expr[i].value == '=') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 == v1);
                    } else if (expr[i].value == '<>') {
                        var v1 = result.pop();
                        var v2 = result.pop();
                        result.push(v2 != v1);
                    } else {
                        Log("error: expression operation < " + expr[i].operation + " > value < " + expr[i].value + " > unknown");
                    }
                }
            }
        } else if (expr[i].operation == 'placeholder') {
            //Log("evalExpression: placeholder: " + expr[i].value)
            // TODO: eigentlich sind "placeholder" Strings mit Dollar-Syntax: 
            //   <placeholder>$FUB$.farbwechsel</placeholder>
            //   entsprechend müssten wir hier noch eine Textersetzung durchführen.
            result.push(expr[i].value);
        } else {
            Log("error: expression operation < " + expr[i].operation + " > unknown");
        }
    }
    return result[0];
}

function getAngleToXAxis(xCenter, xArc, yCenter, yArc, rx, ry) {
    yStretch = rx / ry;
    
    var deltaX = xArc - xCenter;
    var deltaY = (yArc - yCenter) * yStretch ;
    
    if (xArc > xCenter) {
        if (yArc == yCenter) {
            return 0;
        } else if (yArc > yCenter) {
            // 0 < angle < pi/2
            return Math.atan( deltaY / deltaX );
        } else if (yArc < yCenter) {
            // 3pi/2 < angle < 2pi
            return 2*Math.PI + Math.atan( deltaY / deltaX );
        }
    } else if (xArc < xCenter) {
        if (yArc == yCenter) {
            return Math.PI;
        } else if (yArc > yCenter) {
            // pi/2 < angle < pi
            return Math.PI + Math.atan( deltaY / deltaX );
        } else if (yArc < yCenter) {
            // pi < angle < 3pi/2 
            return Math.PI + Math.atan( deltaY / deltaX );
        }
    } else if (xArc == xCenter) {
        if (yArc > yCenter) {
            return Math.PI/2;
        } else if (yArc < yCenter) {
            return 3*Math.PI/2;
        } else {
            // not sure what to do here
            // we have a Piechart with both radii =0
            return;
        }
    }				
}

function setLineDash(dashStyle, ctx) {
    switch(parseInt(dashStyle)) {
        case 1:
            ctx.setLineDash([]);
        case 2: 
            ctx.setLineDash([3,3]);
            break;
        case 3:
            ctx.setLineDash([8,5,3,5]);
            break;
        case 4:
            ctx.setLineDash([8,3,3,3,3,3]);
            break;
        default:
            // pass
    }
}

function resetLineDash(ctx) {
    ctx.setLineDash([]);
}

function drawAllObjects(ctx, clickContext, objects) {
    for (var objId in objects) {
        obj = objects[objId];
        if (obj.isA == "SimpleShape") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();
            clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.strokeStyle = decimalToColorString(objId);

            var left = 0;
            if (obj.leftExpr.length > 0) { left = evalExpression(obj.leftExpr); }
            var top = 0;
            if (obj.topExpr.length > 0) { top = evalExpression(obj.topExpr); }
            var right = 0;
            if (obj.rightExpr.length > 0) { right = evalExpression(obj.rightExpr); }
            var bottom = 0;
            if (obj.bottomExpr.length > 0) { bottom = evalExpression(obj.bottomExpr); }
            var frameStyle = 0;
            if (obj.frameFlagsExpr.length > 0) { frameStyle = evalExpression(obj.frameFlagsExpr); }

            switch (obj.shape) {
                case 'rectangle':
                    ctx.rect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
                    clickContext.rect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
                    break;
                case 'round-rect':
                    radius = (obj.w + right - left) / 20;
                    ctx.roundRect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top, radius);
                    clickContext.roundRect(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top, radius);
                    break;
                case 'circle':
                    ctx.ellipse(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
                    clickContext.ellipse(obj.x + left, obj.y + top, obj.w + right - left, obj.h + bottom - top);
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
            clickContext.fill();

            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                setLineDash(frameStyle, ctx);
                ctx.stroke();
                clickContext.stroke();
                resetLineDash(ctx);
            }

            ctx.closePath();
            clickContext.closePath();
        } else if (obj.isA == "Bitmap") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();
            clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.strokeStyle = decimalToColorString(objId);

            try {
                ctx.drawImage(obj.img, 0, 0, obj.img.width, obj.img.height, obj.x, obj.y, obj.w, obj.h);
            } catch (e) {
                Log("drawImage " + obj.img.src + " error " + e.name);
            }
            ctx.rect(obj.x, obj.y, obj.w, obj.h);
            clickContext.rect(obj.x, obj.y, obj.w, obj.h);
            clickContext.fill();
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = obj.strokeStyle;
                ctx.stroke();
                clickContext.stroke();
            }
            ctx.closePath();
            clickContext.closePath();
        } else if (obj.isA == "Button") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            ctx.beginPath();
            clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.strokeStyle = decimalToColorString(objId);

            ctx.rect(obj.x, obj.y, obj.w, obj.h);
            clickContext.rect(obj.x, obj.y, obj.w, obj.h);

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
            clickContext.fill();
            
            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                ctx.stroke();
                clickContext.stroke();
            }

            ctx.closePath();
            clickContext.closePath();

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
            clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.strokeStyle = decimalToColorString(objId);

            var left = 0;
            if (obj.leftExpr.length > 0) { left = evalExpression(obj.leftExpr); }
            var top = 0;
            if (obj.topExpr.length > 0) { top = evalExpression(obj.topExpr); }
            var lineStyle = 0;
            if (obj.frameFlagsExpr.length > 0) { lineStyle = evalExpression(obj.frameFlagsExpr); }

            if (obj.polyShape == 'polyline' || obj.polyShape == 'polygon')
            {
                var first = true;
                var firstPointFields = [];
                for (var ptId in obj.points) {
                    point = obj.points[ptId];
                    var pointFields = point.split(',');
                    x = parseInt(pointFields[0]);
                    y = parseInt(pointFields[1]);

                    if (first) {
                        firstPointFields = pointFields;
                        ctx.moveTo(x + left, y + top);
                        clickContext.moveTo(x + left, y + top);
                        first = false;
                    } else {
                        ctx.lineTo(x + left, y + top);
                        clickContext.lineTo(x + left, y + top);
                    }
                }

                // ein polygon ist geschlossen, eine polyline nicht...
                if (obj.polyShape == 'polygon') {
                    x = parseInt(firstPointFields[0]);
                    y = parseInt(firstPointFields[1]);
                    ctx.lineTo(x + left, y + top);
                    clickContext.lineTo(x + left, y + top);
                }

            } else if (obj.polyShape == 'bezier') {
                var countControlPoint = 0;
                var first = true;
                var ctrlPointx = [];
                var ctrlPointy = [];

                for (var ptId in obj.points) {
                    point = obj.points[ptId];
                    var pointFields = point.split(',');
                    x = parseInt(pointFields[0]);
                    y = parseInt(pointFields[1]);

                    if (first) {
                        firstPointFields = pointFields;
                        ctx.moveTo(x + left, y + top);
                        clickContext.moveTo(x + left, y + top);
                        first = false;
                        countControlPoint++;
                        continue;
                    }

                    if (countControlPoint) {
                        // write control points to buffer
                        ctrlPointx[countControlPoint] = x;
                        ctrlPointy[countControlPoint] = y;
                        if (countControlPoint >= 2){
                            countControlPoint = 0;
                        } else {
                            countControlPoint++;
                        }
                    } else {
                        // draw bezier kurve between Point P[n-3] and P[n] with control points P[n-2] and P[n-1] 
                        ctx.bezierCurveTo(
                                ctrlPointx[1] + left, 
                                ctrlPointy[1] + top, 
                                ctrlPointx[2] + left, 
                                ctrlPointy[2] + top, 
                                x + left, 
                                y + top);
                        clickContext.bezierCurveTo(
                                ctrlPointx[1] + left, 
                                ctrlPointy[1] + top, 
                                ctrlPointx[2] + left, 
                                ctrlPointy[2] + top, 
                                x + left, 
                                y + top); 
                        countControlPoint++;
                    }
                }
                // draw last part if line (s)
                if (countControlPoint == 2) {
                    //Log(ctrlPointx[1] + " " + ctrlPointy[1]);
                    ctx.lineTo(ctrlPointx[1] + left, ctrlPointy[1] + top);
                    clickContext.lineTo(ctrlPointx[1] + left, ctrlPointy[1] + top);
                } else if (countControlPoint == 0) {
                    ctx.lineTo(ctrlPointx[1] + left, ctrlPointy[1] + top);
                    ctx.lineTo(ctrlPointx[2] + left, ctrlPointy[2] + top);
                    clickContext.lineTo(ctrlPointx[1] + left, ctrlPointy[1] + top);
                    clickContext.lineTo(ctrlPointx[2] + left, ctrlPointy[2] + top);      
                }
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
                clickContext.fill();
            }

            // draw border
            if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                setLineDash(lineStyle, ctx);
                ctx.stroke();
                clickContext.stroke();
                resetLineDash(ctx);
            }

            ctx.closePath();
            clickContext.closePath();
        } else if (obj.isA == "Piechart") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            var frameStyle = 0;
            if (obj.frameFlagsExpr.length > 0) { frameStyle = evalExpression(obj.frameFlagsExpr); }
                                 
            //ctx.beginPath();
            //clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.strokeStyle = decimalToColorString(objId);

            var pBuffer;
            
            // get characteristic points

            pBuffer = obj.points[0].split(',');
            var pCenter = [
                parseInt(pBuffer[0]),
                parseInt(pBuffer[1])
            ];

            pBuffer = obj.points[1].split(',');
            var pBottomLeft = [
                parseInt(pBuffer[0]),
                parseInt(pBuffer[1])
            ];

            pBuffer = obj.points[2].split(',');
            var pStart = [
                parseInt(pBuffer[0]),
                parseInt(pBuffer[1])
            ];

            pBuffer = obj.points[3].split(',');
            var pEnd = [
                parseInt(pBuffer[0]),
                parseInt(pBuffer[1])
            ];

            var x = 0;
            var y = 1;

            var radiusx = pBottomLeft[x] - pCenter[x];  
            var radiusy = pBottomLeft[y] - pCenter[y];

            var startAngle, endAngle;

            // you can either specify the angles by moving the points in codesys or by 
            // setting the values in the element parameters
            if(obj.angle1Expr.length > 0) {
                startAngle = convertAngle(deg2rad(evalExpression(obj.angle1Expr)));
            } else {
                startAngle = getAngleToXAxis(pCenter[x], pStart[x], pCenter[y], pStart[y], radiusx, radiusy);
            }

            if(obj.angle2Expr.length > 0) {
                endAngle = convertAngle(deg2rad(evalExpression(obj.angle2Expr)));
            } else {
                endAngle = getAngleToXAxis(pCenter[x], pEnd[x], pCenter[y], pEnd[y], radiusx, radiusy);
            }

            if (obj.onlyShowArc == 'true') {
                ctx.ellipseArc(pCenter[x], pCenter[y], radiusx, radiusy, startAngle, endAngle, false);
                clickContext.ellipseArc(pCenter[x], pCenter[y], radiusx, radiusy, startAngle, endAngle, false);
            } else {
                ctx.ellipseSector(pCenter[x], pCenter[y], radiusx, radiusy, startAngle, endAngle, false);
                clickContext.ellipseSector(pCenter[x], pCenter[y], radiusx, radiusy, startAngle, endAngle, false);
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
            if (obj.onlyShowArc == 'false') {
                if (obj.hasInsideColor == 'true') {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
                clickContext.fill();
            }

             // draw border
             if (obj.hasFrameColor == 'true') {
                ctx.lineWidth = obj.lineWidth;
                ctx.strokeStyle = strokeStyle;
                setLineDash(frameStyle, ctx);
                ctx.stroke();
                clickContext.stroke();
                resetLineDash(ctx);
            }

            ctx.closePath();
            clickContext.closePath();
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

                for (var lineId in lines) {
                    var line = lines[lineId];

                    ctx.fillText(line, obj.x, myY);

                    myY = myY + fontHeight;
                }
            } else {
                ctx.fillText(txt, obj.x, obj.y);
            }

            ctx.closePath();
        } else if (obj.isA == "ScrollbarSlider") {
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }
            const SCROLLBAR_COLOR_SLIDER_BG = "rgb(150,150,150)";
            const SCROLLBAR_COLOR_SLIDER = "rgb(200,200,200)"

            var x = obj.x;
            var y = obj.y;
            var sliderWidth = obj.w;
            var width = obj.sliderAreaWidth;    // longer side
            var height = obj.sliderAreaHeight;  // shorter side
            var isHorizontal = obj.isHorizontal;


            var lowerBound = 0;
            var upperBound = 10;
            var tapVar = 5;

            if (obj.usedForSubvisu) {
                lowerBound = obj.lowerBound;
                upperBound = obj.upperBound;
                tapVar = obj.sliderValue;
            } else {
                if (obj.lowerBoundExpr.length > 0) {
                    lowerBound = evalExpression(obj.lowerBoundExpr);
                }
                if (obj.upperBoundExpr.length > 0) {
                    upperBound = evalExpression(obj.upperBoundExpr);
                }
                if (obj.tapVarExpr.length > 0) {
                    tapVar = evalExpression(obj.tapVarExpr);
                }
            }
            
            var sliderDistance = Math.abs(upperBound - lowerBound);

            var isInverted = (upperBound < lowerBound);
            if(isInverted) {
                var buffer;
                buffer = upperBound;
                upperBound = lowerBound;
                lowerBound = buffer;
            }

            ctx.beginPath();
            var sliderPosRelative;
            var sliderPos;
            if (isHorizontal) {
                if (isInverted) {
                    if (tapVar < lowerBound) {
                        sliderPos = x + width;
                    } else if (tapVar > upperBound) {
                        sliderPos = x;
                    } else {
                        sliderPosRelative = (tapVar - lowerBound) / sliderDistance;
                        sliderPos = x + width - sliderPosRelative * width;
                    }
                } else {
                    if (tapVar < lowerBound) {
                        sliderPos = x;
                    } else if (tapVar > upperBound) {
                        sliderPos = x + width;
                    } else {
                        sliderPosRelative = (tapVar - lowerBound) / sliderDistance;
                        sliderPos = x + sliderPosRelative * width;
                    }
                }
                ctx.rect(sliderPos, y, sliderWidth, height);
            } else {
                if (isInverted) {
                    if (tapVar < lowerBound) {
                        sliderPos = y;
                    } else if (tapVar > upperBound) {
                        sliderPos = y + width;
                    } else {
                        sliderPosRelative = (tapVar - lowerBound) / sliderDistance;
                        sliderPos = y + sliderPosRelative * width;
                    }
                } else {
                    if (tapVar < lowerBound) {
                        sliderPos = y + width;
                    } else if (tapVar > upperBound) {
                        sliderPos = y;
                    } else {
                        sliderPosRelative = (tapVar - lowerBound) / sliderDistance;
                        sliderPos = y + width - sliderPosRelative * width;
                    }
                }
                ctx.rect(x, sliderPos, height, sliderWidth);                
            }
            ctx.fillStyle = SCROLLBAR_COLOR_SLIDER_BG;
            ctx.fill();
            ctx.closePath;

            ctx.beginPath();
            /* pseudocode, TO DO: visual feedback on click (optional)
            if (click) {
                ctx.save();
                ctx.translate(1,1);
            } */
            if (isHorizontal) {
                ctx.rect(sliderPos, y, sliderWidth-2, height-2);
            } else {
                ctx.rect(x, sliderPos, height-2, sliderWidth-2)
            }
            ctx.fillStyle = SCROLLBAR_COLOR_SLIDER;
            ctx.fill();
            /* pseudocode, TO DO: visual feedback on click (optional)
            if (click) {
                ctx.recall();
            } */
            ctx.closePath();

            clickContext.beginPath();
            clickContext.fillStyle = decimalToColorString(objId);
            if (isHorizontal) {
                clickContext.rect(sliderPos, y, sliderWidth, height);
            } else {
                clickContext.rect(x, sliderPos, height, sliderWidth);
            }
            clickContext.fill();
            clickContext.closePath();
        } else if (obj.isA == "ScrollbarArrow") {
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }
            const SCROLLBAR_COLOR_ARROW = "rgb(0,0,0)";
            const SCROLLBAR_COLOR_ARROWBOX_BG = "rgb(150,150,150)";
            const SCROLLBAR_COLOR_ARROWBOX = "rgb(200,200,200)";

            var x = obj.x;
            var y = obj.y;
            var width = obj.width;
            var height = obj.height;
            var direction = obj.direction;

            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fillStyle = SCROLLBAR_COLOR_ARROWBOX_BG;
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.rect(x, y, width-2, height-2);
            ctx.fillStyle = SCROLLBAR_COLOR_ARROWBOX;
            ctx.fill();
            ctx.closePath();

            ctx.arrowboxTriangle(x + width/4, y + height/4, x+width*3/4, y+height*3/4, direction, SCROLLBAR_COLOR_ARROW);

            clickContext.beginPath();
            clickContext.rect(x, y, width, height);
            clickContext.fillStyle = decimalToColorString(objId);
            clickContext.fill();
            clickContext.closePath();
            
        } else if (obj.isA == "Subvisu") {
            ctx.save();
            clickContext.save();

            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    ctx.beginPath();
                    ctx.rect(0,0,0,0);
                    ctx.clip();
                    ctx.closePath();
                    clickContext.beginPath();
                    clickContext.rect(0,0,0,0);
                    clickContext.clip();
                    clickContext.closePath();
                    continue;
                }
            }

            var xOffset = obj.rectFields[0];
            var yOffset = obj.rectFields[1];
            var width = obj.rectFields[2] - obj.rectFields[0];
            var height = obj.rectFields[3] - obj.rectFields[1];

            if (obj.fixedFrameScrollable == "true") {
                if (drawObjects[obj.scrollbarSliderIds["vertical"]]) {
                    width -= SUBVISU_SCROLLBAR_WIDTH;
                }
                if (drawObjects[obj.scrollbarSliderIds["horizontal"]]) {
                    height -= SUBVISU_SCROLLBAR_WIDTH;
                }
            }

            

            if (obj.clipFrame == "true") {
                ctx.beginPath();
                ctx.rect(xOffset, yOffset, width, height);
                ctx.clip();
                ctx.closePath();

                clickContext.beginPath();
                clickContext.rect(xOffset, yOffset, width, height);
                clickContext.clip();
                clickContext.closePath();
            }

            ctx.translate(xOffset, yOffset);
            clickContext.translate(xOffset,yOffset);

            if (obj.fixedFrameScrollable == "true") {
                var sliderIds = obj.scrollbarSliderIds;
                sliders = [
                    drawObjects[sliderIds["horizontal"]] || {sliderValue:0},
                    drawObjects[sliderIds["vertical"]] || {sliderValue:0}
                ];
                ctx.translate(-sliders[0].sliderValue, -sliders[1].sliderValue);
                clickContext.translate(-sliders[0].sliderValue, -sliders[1].sliderValue);
            }
            if (obj.fixedFrame == "false" && obj.fixedFrameScrollable == "false") {
                var scaleFactorX = width / obj.subvisuSize[0];
                var scaleFactorY = height / obj.subvisuSize[1];

                if (obj.scaleIsotropic == "true")
                {
                    if (scaleFactorX < scaleFactorY) {
                        ctx.scale(scaleFactorX, scaleFactorX);
                        clickContext.scale(scaleFactorX, scaleFactorX);
                    } else {
                        ctx.scale(scaleFactorY, scaleFactorY);
                        clickContext.scale(scaleFactorY, scaleFactorY);
                    }
                } else {
                    ctx.scale(scaleFactorX, scaleFactorY);
                    clickContext.scale(scaleFactorX, scaleFactorY);
                }
            }

        } else if (obj.isA == "EndSubvisu") {
            ctx.restore();
            clickContext.restore();

            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            var xOffset = obj.rectFields[0];
            var yOffset = obj.rectFields[1];
            var width = obj.rectFields[2] - obj.rectFields[0];
            var height = obj.rectFields[3] - obj.rectFields[1];

            
            if(obj.showFrame == "true") {
                ctx.strokeStyle = "rgb(" + obj.frameColor + ")";
                ctx.lineWidth = parseInt(obj.lineWidth) || 1;
                ctx.beginPath();
                ctx.rect(xOffset, yOffset, width, height);
                ctx.stroke();
                ctx.closePath();
            }

        } else if (obj.isA == "NotImplemented") {
            // is invisible?
            if (obj.invisibleExpr.length > 0) {
                if (evalExpression(obj.invisibleExpr) > 0) {
                    continue;
                }
            }

            var rectFields = obj.rectFields;

            ctx.strokeStyle = "rgb(0,0,0)";

            ctx.beginPath();
            ctx.rect(rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1]);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(rectFields[0], rectFields[1]);
            ctx.lineTo(rectFields[2], rectFields[3]);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(rectFields[2], rectFields[1]);
            ctx.lineTo(rectFields[0], rectFields[3]);
            ctx.stroke();
            ctx.closePath();

            /*
            ctx.font = '10px Arial';
            ctx.fillText("not implemented yet", rectFields[0], rectFields[1]+10);
            */

        } else if (obj.isA == "Group") {
            ctx.save();
            ctx.translate(obj.x, obj.y);
            clickContext.save();
            clickContext.translate(obj.x, obj.y);
        } else if (obj.isA == "EndGroup") {
            ctx.restore();
            clickContext.restore();
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

    // Klick-Kontext ebenfalls vorbereiten.
    clickContext.beginPath();
    clickContext.fillStyle = '#FFFFFF';
    clickContext.fillRect(0, 0, visuSizeX, visuSizeY);
    //clickContext.clearRect(0, 0, visuSizeX, visuSizeY);
    clickContext.closePath();

    drawAllObjects(ctx, clickContext, drawObjects);

    // Um die Klick-Regionen sichtbar zu machen...
    //ctx.beginPath();
    //ctx.drawImage(clickCanvas, 0, 0);
    //ctx.closePath();
    
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

