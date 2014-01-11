// codesys.js

var PendingMouseUpObjects = [];

// constructor
function expression(operation, value) {
	this.operation = operation;
	this.value = value;
}

function extract_var_addr( content ) {
	$(content).find("variable").each( function() {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		// einzelne werte auslesen und zwischenspeichern
		// attribute: funktion 'attr()'
		// tags: nach dem tag suchen & text auslesen
		var name = $myMedia.attr("name");
		var addr = $myMedia.text();

		registerVariable(name, addr, '');
	});
}

function load_ini_success( content ) {
	extract_var_addr( content );
}

function load_ini(filename) {
	$.ajax({
		type: 'GET',
		async: false,
		url: filename,
		success: load_ini_success
	});
}

/*
OK:
		<expr-toggle-color>
			<expr>
				<var>LICHTSTEUERUNG.SSLichtKueche3.xAktor</var>
			</expr>
		</expr-toggle-color>
OK:
		<expr-toggle-color>
			<expr>
				<var>ROLLOSTEUERUNG.jalKueche.xActor1</var>
				<var>ROLLOSTEUERUNG.jalKueche.xActor2</var>
				<op>OR(2)</op>
			</expr>
		</expr-toggle-color>
*/
function parseExpression(parentTag) {
	var expr = [];
	var exprTag = parentTag.find('expr');
	if (exprTag.length) {
		exprTag.children().each(function () {
			var tagName = this.tagName;
			var val = $(this).text();
			expr.push(new expression(tagName, val));
		});
	}
	return expr;
}

function parseTextInfo(myMedia, centerFields, rectFields) {
	var text_format = myMedia.find('text-format').text();
	if (text_format.length < 1) {
		return;
	}
	var font_color = myMedia.find('font-color').text();
	var font_name = myMedia.find('font-name').text();
	var font_height = myMedia.find('font-height').text();
	var text_align_horz = myMedia.find('text-align-horz').text();
	var text_align_vert = myMedia.find('text-align-vert').text();
	var textX = centerFields[0];
	var textY = centerFields[1];
	var textAlignHorz = 'center';
	var textAlignVert = 'middle';
	if (text_align_horz == 'center') {
		// center
		textAlignHorz = 'center';
	} else if (text_align_horz == 'left') {
		// left
		textX = rectFields[0];
		textAlignHorz = 'start';
	} else {
		// right
		textX = rectFields[2];
		textAlignHorz = 'end';
	}
	if (text_align_vert == 'center') {
		// center
		textAlignVert = 'middle';
	} else if (text_align_vert == 'top') {
		// top
		textY = rectFields[1];
		textAlignVert = 'top';
	} else {
		// bottom
		textY = rectFields[3];
		textAlignVert = 'bottom';
	}

	var text_display = myMedia.find('text-display');
	var variable = '';
	if (text_display.length) {
		var text_display_exp = text_display.find('expr');
		if (text_display_exp.length) {
			variable = text_display_exp.find('var').text();
		}
	}

	registerText(
			textX, textY,
			text_format,
			variable,
			'rgb('+font_color+')',
			textAlignHorz,
			textAlignVert,
			font_name,
			font_height
		);
}

function parseClickInfo(myMedia, rectFields) {
    var expr_toggle_var = myMedia.find('expr-toggle-var');
    value = '';
    if (expr_toggle_var.length) {
        var expr_toggle_var_exp = expr_toggle_var.find('expr');
        if (expr_toggle_var_exp.length) {
            value = expr_toggle_var_exp.find('var').text();
            registerClickToggle(
                rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
                value
                );
        }
    }

    var expr_tap_var = myMedia.find('expr-tap-var');
    value = '';
    if (expr_tap_var.length) {
        var expr_tap_var_exp = expr_tap_var.find('expr');
        if (expr_tap_var_exp.length) {
            value = expr_tap_var_exp.find('var').text();
            var tap_false = myMedia.find('tap-false').text();
            registerClickTap(
                rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
                value, (tap_false == 'true' ? 0 : 1)
                );
        }
    }

    var expr_zoom = myMedia.find('expr-zoom');
    value = '';
    if (expr_zoom.length) {
        var expr_zoom_exp = expr_zoom.find('expr');
        if (expr_zoom_exp.length) {
            newvisu = expr_zoom_exp.find('placeholder').text();
            registerClickZoom(
                rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
                newvisu
                );
        }
    }
}

function load_visu_success(content) {
    var xmlstr = content.xml ? content.xml : (new XMLSerializer()).serializeToString(content);
    console.debug("content: " + xmlstr);

	extract_var_addr( content );

	$(content).find("visualisation").each( function() {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		visuName = $myMedia.find('name').text();

		var size = $myMedia.find('size').text();
		var sizeFields = size.split(',');
		visuSizeX = sizeFields[0];
		visuSizeY = sizeFields[1];

		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.width = visuSizeX;
		canvas.height = visuSizeY;
		//$('#canvas').WIDTH = visuSizeX;
		//$('#canvas').HEIGHT = visuSizeY;
	});


	$(content).find("element").each( function() {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		// einzelne werte auslesen und zwischenspeichern
		// attribute: funktion 'attr()'
		// tags: nach dem tag suchen & text auslesen
		var type = $myMedia.attr("type");

		console.debug("parse " + type);
		if (type == 'simple') {
			var shape = $myMedia.find('simple-shape').text();
			//console.log("parse " + shape);
			if (shape == 'rectangle') {
				var rect = $myMedia.find('rect').text();
				var rectFields = rect.split(',');
				var fill_color = $myMedia.find('fill-color').text();
				var fill_color_alarm = $myMedia.find('fill-color-alarm').text();
				var line_width = $myMedia.find('line-width').text();
				var frame_color = $myMedia.find('frame-color').text();
				var center = $myMedia.find('center').text();
				var centerFields = center.split(',');

				// parse expression
				var exprToggleColor = [];
				var expr_toggle_color = $myMedia.find('expr-toggle-color');
				if( expr_toggle_color.length ) {
					exprToggleColor = parseExpression(expr_toggle_color);
				}

				var exprLeft = [];
				var expr_left = $myMedia.find('expr-left');
				if (expr_left.length) {
					exprLeft = parseExpression(expr_left);
				}

				var exprTop = [];
				var expr_top = $myMedia.find('expr-top');
				if (expr_top.length) {
					exprTop = parseExpression(expr_top);
				}

				var exprRight = [];
				var expr_right = $myMedia.find('expr-right');
				if (expr_right.length) {
					exprRight = parseExpression(expr_right);
				}

				var exprBottom = [];
				var expr_bottom = $myMedia.find('expr-bottom');
				if (expr_bottom.length) {
					exprBottom = parseExpression(expr_bottom);
				}

				registerRectangle(
						rectFields[0], rectFields[1], rectFields[2]-rectFields[0], rectFields[3]-rectFields[1],
						"rgb("+fill_color+")",
						line_width,
						"rgb("+frame_color+")",
						exprToggleColor,
						"rgb("+fill_color_alarm+")",
						exprLeft, exprTop, exprRight, exprBottom
					);

				parseTextInfo($myMedia, centerFields, rectFields);

				parseClickInfo($myMedia, rectFields);
			} else if( shape == 'round-rect' ) {
				var rect = $myMedia.find('rect').text();
				var rectFields = rect.split(',');
				var fill_color = $myMedia.find('fill-color').text();
				var fill_color_alarm = $myMedia.find('fill-color-alarm').text();
				var line_width = $myMedia.find('line-width').text();
				var frame_color = $myMedia.find('frame-color').text();
				var center = $myMedia.find('center').text();
				var centerFields = center.split(',');

				var expr = [];
				var expr_toggle_color = $myMedia.find('expr-toggle-color');
				if (expr_toggle_color.length) {
					expr = parseExpression(expr_toggle_color);
				}

				registerRoundRect(
						rectFields[0], rectFields[1], rectFields[2]-rectFields[0], rectFields[3]-rectFields[1],
						"rgb("+fill_color+")",
						line_width,
						"rgb("+frame_color+")",
						expr,
						"rgb("+fill_color_alarm+")"
					);

				parseTextInfo($myMedia, centerFields, rectFields, value);

				parseClickInfo($myMedia, rectFields);
			} else {
				console.log("unknown simple-shape: " + shape);
			}
		} else if (type == 'bitmap') {
		    console.debug("register bitmap");
		    var filename = $myMedia.find('file-name').text();
			var fileFields = filename.split('\\');
			filename = fileFields[fileFields.length - 1];
			var rect = $myMedia.find('rect').text();
			var rectFields = rect.split(',');
			var center = $myMedia.find('center').text();
			var centerFields = center.split(',');

			registerBitmap(
				rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
				filename
				);

			parseTextInfo($myMedia, centerFields, rectFields);

			parseClickInfo($myMedia, rectFields);
		} else {
		    console.log("unknown type: " + type);
		}
	});
}

function load_visu(filename) {
    console.debug("load " + filename);
	$.ajax({
		type: 'GET',
		async: false,
		url: filename,
		dataType: 'xml',
		success: load_visu_success
	});
}

// holt Aktualisierungen für alle bekannten Variablen vom webserver
function update_vars() {
	var req = "";
	var count = 0;
	$.each(visuVariables, function (key, obj) {
		req = req + "|"+count+"|"+obj.addrP;
		count++;
	});

	req = "|0|"+count+""+req+"|";

	//console.log("update_vars");
	//console.log("REQ = " + req);

	$.ajax({
		type: 'POST',
		async: false,
		url: "/plc/webvisu.htm",
		data: req,
		success: function (data) {
			//console.log("ANS = " + data);
			var fields = data.split('|');
			var count = 1; // split zählt bereits vor dem ersten trenner
			$.each(visuVariables, function (key, obj) {
				if( obj.numBytes == 1 ) {
					obj.value = fields[count] & 0xFF;
				} else if( obj.numBytes == 2 ) {
					obj.value = fields[count] & 0xFFFF;
				} else if( obj.numBytes == 4 ) {
					obj.value = fields[count] & 0xFFFFFFFF;
				} else {
					obj.value = fields[count];
				}
				count++;
			});
		}
	});
}

// der Click-Handler
function onClick( e ) {
	var x = e.pageX-$("#canvas").offset().left;
	var y = e.pageY - $("#canvas").offset().top;
	//console.log("onClick");
	//console.log("X " + e.pageX + " Y " + e.pageY);
	//console.log("X " + x + " Y " + y);

	for( var i in clickToggles ) {
		obj = clickToggles[i];

		//console.log("obj.x " + obj.x + " obj.y " + obj.y + " (obj.x+obj.w) " + (obj.x + obj.w) + " (obj.y+obj.h) " + (obj.y + obj.h));

		if(( obj.x <= x ) && ( obj.y <= y ) && ( (obj.x+obj.w) >= x ) && ( (obj.y+obj.h) >= y )) {
			if( obj.variable != '' ) {
				var newval = 1 - visuVariables[obj.variable].value;
				var req = '|1|1|0|' + visuVariables[obj.variable].addrP + '|' + newval + '|';

				$.ajax({
					type: 'POST',
					async: false,
					url: '/plc/webvisu.htm',
					data: req,
					//success: function( data ) {
					//	console.log("success: " + data);
					//}
				});

				visuVariables[obj.variable].value = newval;
				update();
			}
		}
	}

	var myClickZoom = clickZoom;
	for (var i in myClickZoom) {
		obj = myClickZoom[i];

		if ((obj.x <= x) && (obj.y <= y) && ((obj.x + obj.w) >= x) && ((obj.y + obj.h) >= y)) {
			switchToVisu(obj.visu);
		}
	}

}

// der MouseDown-Handler
function onMouseDown(e) {
	var x = e.pageX - $("#canvas").offset().left;
	var y = e.pageY - $("#canvas").offset().top;
	//console.log("onMouseDown");
	//console.log("X " + e.pageX + " Y " + e.pageY);
	//console.log("X " + x + " Y " + y);

    // ein neuer MouseDown hatte sicherlich einen MouseUp voran - nur, falls der verloren ging
    // passiert komischerweise ab und zu bei Firefox
	HandlePendingMouseUps();

	for (var i in clickTap) {
		obj = clickTap[i];

		if ((obj.x <= x) && (obj.y <= y) && (obj.x + obj.w >= x) && (obj.y + obj.h >= y)) {
			PendingMouseUpObjects.push(obj);
			if (obj.variable != '') {
				var newval = obj.newval;
				var req = '|1|1|0|' + visuVariables[obj.variable].addrP + '|' + newval + '|';

				$.ajax({
					type: 'POST',
					async: false,
					url: '/plc/webvisu.htm',
					data: req,
				});

				visuVariables[obj.variable].value = newval;
				update();
			}
		}
	}

}

// Ein MouseDowqn registriert die betroffenen Objekte in der PendingMouseUp Liste.
// Diese wird bei einem echten MouseUp, aber auch vor einem erneuten MouseDown abgearbeitet.
function HandlePendingMouseUps() {
	for (var i in PendingMouseUpObjects) {
		obj = PendingMouseUpObjects[i];
		if (obj.variable != '') {
			var newval = 1 - obj.newval;
			var req = '|1|1|0|' + visuVariables[obj.variable].addrP + '|' + newval + '|';

			$.ajax({
				type: 'POST',
				async: false,
				url: '/plc/webvisu.htm',
				data: req,
			});

			visuVariables[obj.variable].value = newval;
			update();
		}
	}
	PendingMouseUpObjects = [];
}

// der MouseUp-Handler
// leider hat (zumindest) der Firefox das Problem, dass er MouseUp-Events manchmal nicht schickt.
// Deshalb wurde der normale MouseUp (der genauso funktionierte wie der MouseDown) ersetzt durch
// den Mechanismus "PendingMouseUp".
function onMouseUp(e) {
	HandlePendingMouseUps();
}


