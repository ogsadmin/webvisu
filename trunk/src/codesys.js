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

function load_ini_success(content) {

	$(content).find("visu-ini-file").each(function () {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		visuCompressed = $myMedia.find('compression').text() == "true" ? 1 : 0;

		extract_var_addr($myMedia);
	});
}

function load_ini(filename) {
	$.ajax({
		type: 'GET',
		async: false,
		url: filename,
		success: load_ini_success
	});
}

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


	var exprTextDisplay = [];
	var expr_text_display = myMedia.find('text-display');
	if (expr_text_display.length) {
		exprTextDisplay = parseExpression(expr_text_display);
	}

	var exprTextColor = [];
	var expr_text_color = myMedia.find('expr-text-color');
	if (expr_text_color.length) {
		exprTextColor = parseExpression(expr_text_color);
	}


	registerText(
			textX, textY,
			text_format,
			exprTextDisplay,
			'rgb('+font_color+')',
			exprTextColor,
			textAlignHorz,
			textAlignVert,
			font_name,
			font_height
		);
}

function parseClickInfo(myMedia, rectFields) {

	/*
		<expr-toggle-var>
			<expr>
				<var>PLC_PRG.bVarToggeln</var>
			</expr>
		</expr-toggle-var>
	*/
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

	/*
		<expr-tap-var>
			<expr>
				<var>PLC_PRG.bVarTasten</var>
			</expr>
		</expr-tap-var>
	*/
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

	/*
		<expr-zoom>
			<expr>
				<placeholder>PLC_VISU</placeholder>
			</expr>
		</expr-zoom>
	*/
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

	/* TODO:
		<input-action-list>
			<expr-assign>
				<lvalue>
					<expr>
						<var>.rSollwertBuero</var>
					</expr>
				</lvalue>
				<rvalue>
					<expr>
						<var>.rSollwertBuero</var>
						<const>0.5</const>
						<op>+(2)</op>
					</expr>
				</rvalue>
			</expr-assign>
		</input-action-list>
	*/
}

function array_buffer_8_to_string(buf) {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function array_buffer_16_to_string(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function string_to_array_buffer_16(str) {
	var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

function CheckStr8(str) {
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		if (str.charCodeAt(i) > 127) {
			console.log("WARNING: " + str.charCodeAt(i).toString() + ">127");
		}
		if (str.charCodeAt(i) > 255) {
			console.log("ERROR: " + str.charCodeAt(i).toString() + ">255");
		}
	}
}

// mit zip.js und inflate.js
function load_visu_compressed_success(content) {
	console.log("visu is compressed - try to inflate");

	zip.useWebWorkers = false;
	// use a zip.BlobReader object to read zipped data stored into blob variable
	zip.createReader(new zip.BlobReader(content), function (zipReader) {
		// get entries from the zip file
		zipReader.getEntries(function (entries) {
			// get data from the first file - using the right encoding!
			entries[0].getData(new zip.TextWriter("ISO-8859-1"), function (data) {
				// close the reader and calls callback function with uncompressed data as parameter
				zipReader.close();
				//CheckStr8(data);
				var xml = $.parseXML(data);
				load_visu_success(xml);
			});
		});
	}, function(message) { 
		console.error(message); 
	});
}


function load_visu_success(content) {
	perfLoadEnd = new Date().getTime();
	perfLoad = perfLoadEnd - perfLoadStart;

	//console.log("load_visu_success in " + perfLoad + "ms");

	//var xmlstr = content.xml ? content.xml : (new XMLSerializer()).serializeToString(content);
	//console.debug("content: " + xmlstr);

	//console.debug("content: " + content);

	extract_var_addr( content );

	$(content).find("visualisation").each( function() {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		visuName = $myMedia.find('name').text();

		var size = $myMedia.find('size').text();
		var sizeFields = size.split(',');
		visuSizeX = parseInt(sizeFields[0]);
		visuSizeY = parseInt(sizeFields[1]);

		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.width = visuSizeX+1;
		canvas.height = visuSizeY+1;
		//$('#canvas').WIDTH = visuSizeX+1;
	    //$('#canvas').HEIGHT = visuSizeY+1;


        // optional kann der Hintergrund auch aus einem Bitmap-File bestehen
		var bitmap = $myMedia.find('bitmap').text();
		if (bitmap.length) {
		    registerBitmap(
				0, 0, visuSizeX, visuSizeY,
				bitmap,
                'false', '0,0,0', '0,0,0',
                'false', '0,0,0', '0,0,0',
                0
				);
		}
	});


	$(content).find("element").each( function() {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		// einzelne werte auslesen und zwischenspeichern
		// attribute: funktion 'attr()'
		// tags: nach dem tag suchen & text auslesen
		var type = $myMedia.attr("type");

		//console.debug("parse " + type);
		if (type == 'simple') {
			var shape = $myMedia.find('simple-shape').text();
			//console.log("parse " + shape);
			if (shape == 'rectangle') {
				var rect = $myMedia.find('rect').text();
				var rectFields = rect.split(',');

			    // parse fill attributes
				var fill_color = '255,255,255';
				var fill_color_alarm = '255,255,255';
				var has_inside_color = $myMedia.find('has-inside-color').text();
				if (has_inside_color == 'true') {
				    fill_color = $myMedia.find('fill-color').text();
				    fill_color_alarm = $myMedia.find('fill-color-alarm').text();
				}

			    // parse frame-attributes
				var frame_color = '0,0,0';
				var frame_color_alarm = '0,0,0';
				var has_frame_color = $myMedia.find('has-frame-color').text();
				if (has_frame_color == 'true') {
				    frame_color = $myMedia.find('frame-color').text();
				    frame_color_alarm = $myMedia.find('frame-color-alarm').text();
				}
				var line_width = $myMedia.find('line-width').text();

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
						rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
                        has_inside_color,
						"rgb(" + fill_color + ")",
						"rgb(" + fill_color_alarm + ")",
                        has_frame_color,
						"rgb(" + frame_color + ")",
						"rgb(" + frame_color_alarm + ")",
						line_width,
						exprToggleColor,
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
			} else if (shape == 'circle') {
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
				if (expr_toggle_color.length) {
					exprToggleColor = parseExpression(expr_toggle_color);
				}

				registerCircle(
					rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
					"rgb(" + fill_color + ")",
					line_width,
					"rgb(" + frame_color + ")",
					exprToggleColor,
					"rgb(" + fill_color_alarm + ")"
				);

				parseTextInfo($myMedia, centerFields, rectFields);

				parseClickInfo($myMedia, rectFields);
			} else {
				console.log("unknown simple-shape: " + shape);
			}
		} else if (type == 'bitmap') {
			//console.debug("register bitmap");
			var filename = $myMedia.find('file-name').text();
			var fileFields = filename.split('\\');
			filename = fileFields[fileFields.length - 1];
			var rect = $myMedia.find('rect').text();
			var rectFields = rect.split(',');
			var center = $myMedia.find('center').text();
			var centerFields = center.split(',');

		    // parse fill attributes
			var fill_color = '255,255,255';
			var fill_color_alarm = '255,255,255';
			var has_inside_color = $myMedia.find('has-inside-color').text();
			if (has_inside_color === 'true') {
			    fill_color = $myMedia.find('fill-color').text();
			    fill_color_alarm = $myMedia.find('fill-color-alarm').text();
			}

		    // parse frame-attributes
			var frame_color = '0,0,0';
			var frame_color_alarm = '0,0,0';
			var has_frame_color = $myMedia.find('has-frame-color').text();
			if (has_frame_color == 'true') {
			    frame_color = $myMedia.find('frame-color').text();
			    frame_color_alarm = $myMedia.find('frame-color-alarm').text();
			}
			var line_width = $myMedia.find('line-width').text();
			registerBitmap(
				rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
				filename,
                has_inside_color, fill_color, fill_color_alarm,
                has_frame_color, frame_color, frame_color_alarm, line_width
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

	perfLoadStart = new Date().getTime();

	if (visuCompressed == 1) {
		$.ajax({
			type: 'GET',
			async: false,
			cache: false,
			url: filename,
			//dataType: 'arraybuffer', // mit js-unzip.js und js-inflate.js
			dataType: 'blob', // mit zip.js und inflate.js
			//dataType: 'application/zip',
			//dataType: 'text/plain',
			success: load_visu_compressed_success,
			error: function (jqXHR, textStatus, errorThrown) {
				console.log("load_visu " + textStatus + " " + errorThrown);
			}
		});
	} else {
		$.ajax({
			type: 'GET',
			async: false,
			cache: false,
			url: filename,
			success: load_visu_success,
			error: function (jqXHR, textStatus, errorThrown) {
				console.log("load_visu " + textStatus + " " + errorThrown);
			}
		});
	}
}

// holt Aktualisierungen für alle bekannten Variablen vom webserver
function update_vars() {
	if (perfUpdateStart > perfUpdateEnd)
		return;

	perfUpdateStart = new Date().getTime();

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
		//async: false,
		async: true,
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
			perfUpdateEnd = new Date().getTime();
			perfUpdate = perfUpdateEnd - perfUpdateStart;
			//console.log("update_vars finished in " + perfUpdate + "ms");
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

// Ein MouseDown registriert die betroffenen Objekte in der PendingMouseUp Liste.
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


