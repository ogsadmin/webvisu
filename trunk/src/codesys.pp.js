// codesys.js

// Definitionen von Variablen-Typen, wie sie wahrscheinlich in den ARTI-Adressen verwendet werden
const VAR_TYPE_BOOL = 0;
const VAR_TYPE_INT = 1;
const VAR_TYPE_BYTE = 2;
const VAR_TYPE_WORD = 3;
const VAR_TYPE_DINT = 4;
const VAR_TYPE_DWORD = 5;
const VAR_TYPE_REAL = 6;
const VAR_TYPE_TIME = 7;
const VAR_TYPE_STRING = 8;
const VAR_TYPE_ARRAY = 9;
const VAR_TYPE_ENUM = 10;
const VAR_TYPE_USERDEF = 11;
const VAR_TYPE_BITORBYTE = 12;
const VAR_TYPE_POINTER = 13;
const VAR_TYPE_SINT = 14;
const VAR_TYPE_USINT = 15;
const VAR_TYPE_UINT = 16;
const VAR_TYPE_UDINT = 17;
const VAR_TYPE_DATE = 18;
const VAR_TYPE_TOD = 19;
const VAR_TYPE_DT = 20;
const VAR_TYPE_VOID = 21;
const VAR_TYPE_LREAL = 22;
const VAR_TYPE_REF = 23;
const VAR_TYPE_NONE = 24;


// globale variablen
var postUrl = '/plc/webvisu.htm';

// In welchem Format findet der Variablen-Datenaustausch statt?
// 0 = Standard
// 1 = Beckhoff SOAP
const POST_FORMAT_STANDARD = 0
const POST_FORMAT_SOAP = 1
var postFormat = POST_FORMAT_STANDARD;

/**
Diese variable steuert ob Dateinamen (vor dem Laden vom Server) in 
Kleinbuchstaben umgewandelt werden sollen.

Hintergrund ist, dass einige Steuerungen Case-Sensitive sind; die User jedoch 
frei in der Eingabe. Es scheint so, als ob auf diesen Steuerungen die Dateien
beim Hochladen in Kleinschreibung umgewandelt werden; die Namen in den Visu-
Files bleiben jedoch CamelCase.
*/ 
var filenamesLowercase = false;

var PendingMouseUpObjects = [];

var parsedGroups = [];

/* wenn ein Input-Feld aktiv ist zeigt das diese Variable an. */
var inputFieldActive = false;


// constructor
function expression(operation, count, value) {
    this.operation = operation;
    this.count = count;
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
			var count = 1;

		    //Log("parseExpression <" + tagName + "> <" + val + ">");

		    // Operatoren wollen wir weiter auseinander nehmen
			if (tagName == 'op') {
			    // suche nach dem Klammerausdruck - z.B. "MOD(2)"
			    if (val.indexOf('(') > -1) {
			        countStr = val.substr(val.indexOf('(') + 1);
			        countStr.replace(')', '');
			        count = parseInt(countStr);
			        val = val.substr(0, val.indexOf('('));
			        //Log("  <" + val + "> <" + count + ">");
			    }
			}

			expr.push(new expression(tagName, count, val));
		});
	}
	return expr;
}

function parseTextInfo(myMedia, centerFields, rectFields, exprInvisible) {
	var text_format = myMedia.find('text-format').text();
	if (text_format.length < 1) {
		return;
	}
	var font_color = myMedia.find('font-color').text();
	var font_name = myMedia.find('font-name').text();
	var font_height = parseInt(myMedia.find('font-height').text());
	var font_weight = myMedia.find('font-weight').text();
	var font_italic = myMedia.find('font-italic').text();
	var text_align_horz = myMedia.find('text-align-horz').text();
	var text_align_vert = myMedia.find('text-align-vert').text();
	//var textX = centerFields[0];
	//var textY = centerFields[1];
	var textX = rectFields[0] + (rectFields[2] - rectFields[0]) / 2;
	var textY = rectFields[1] + (rectFields[3] - rectFields[1]) / 2;
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
			'rgb(' + font_color + ')',
			exprTextColor,
			textAlignHorz,
			textAlignVert,
			font_name,
			font_height,
			font_weight,
			font_italic,
			exprInvisible
		);
}

function parseClickInfo(myMedia, rectFields) {

	rectFields[0] += parsedGroups[parsedGroups.length - 1].x;
	rectFields[1] += parsedGroups[parsedGroups.length - 1].y;
	rectFields[2] += parsedGroups[parsedGroups.length - 1].x;
	rectFields[3] += parsedGroups[parsedGroups.length - 1].y;

	/* Die Reihenfolge der Registrierung ist ausschlaggebend für die Funktion 
	   von Mehrfach-Aktionen.
	   Die zoom-to-visu muss als letztes ausgeführt werden, da sie den 
	   Ausführungsablauf unterbricht (lädt neue Visu). Da wir nach dem Laden
	   die Reihenfolge drehen muss zoom-to-visu entsprechend als erstes 
	   registriert werden.
	*/

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
			Log("WARNING: " + str.charCodeAt(i).toString() + ">127");
		}
		if (str.charCodeAt(i) > 255) {
			Log("ERROR: " + str.charCodeAt(i).toString() + ">255");
		}
	}
}

// mit zip.js und inflate.js
function load_visu_compressed_success(content) {
	Log("visu is compressed - try to inflate");

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

	var dynTextFile = '';

	//Log("load_visu_success in " + perfLoad + "ms");

	//var xmlstr = content.xml ? content.xml : (new XMLSerializer()).serializeToString(content);
	//console.debug("content: " + xmlstr);

	//console.debug("content: " + content);

	extract_var_addr(content);

	$(content).find(">visualisation").each(function () {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		visuName = $myMedia.find('name').text();

		var size = $myMedia.find('size').text();
		var sizeFields = size.split(',').map(Number);
		visuSizeX = sizeFields[0];
		visuSizeY = sizeFields[1];

		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.width = visuSizeX + 1;
		canvas.height = visuSizeY + 1;
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

		// wird Dynamic-Text verwendet?
		var dynTextFlag = $myMedia.find('use-dynamic-text').text();
		if (dynTextFlag.length && dynTextFlag == 'true') {
			dynTextFile = $myMedia.find('dynamic-text-file').text();
			/* jetzt wirds eklig: CoDeSys erzeugt auf einer WAGO-Steuerung den XML-Eintrag:
			 * <dynamic-text-file>C:\USERS\FOO\DESKTOP\PROJ\TEXTFILES\DYNAMICTEXTS.XML</dynamic-text-file>
			 * Wir gehen also mal davon aus, dass nur der Dateiname wichtig ist?
			 * Auch steht hier (natürlich) nicht ob es ein XML oder ein XML.ZIP ist. 
			 * Die Datei auf unserer Steuerung heist: "dynamictexts_xml.zip" (alles klein?).
			 */
			dynTextFile = dynTextFile.replace(/^.*[\\\/]/, '');
			dynTextFile = dynTextFile.toLowerCase();
			if (visuCompressed == 1) {
				dynTextFile = dynTextFile.replace('.xml', '_xml.zip');
			}
			visuUseDynamicText = true;
		} else {
			visuUseDynamicText = false;
		}

		parsedGroups = [];
		parsedGroups.push(new newGroup(0, 0, visuSizeX, visuSizeY));
		parse_visu_elements($myMedia);

		/* Jetzt noch (einmalig) die Reihenfolge der Klick-Elemente umdrehen 
		   um verdeckende Elemente zu erkennen.
		   Hintergrund: Zeichnet man ein Element "�ber" ein anderes, so ist es 
		   in Ladereihenfolge hinter dem darunter liegenden. Das untenliegende
		   Element wird also vor dem dar�berliegenden ausgewertet.
		   Das w�re falsch - deshalb drehen wir es hier.
		 */
		clickRegions.reverse();
	});

	if (visuUseDynamicText) {
		load_dyntextfile(plcDir + "/" + dynTextFile);
	}
}


function parse_visu_elements(content) {

	$(content).find(">element").each(function () {
		// gefundenen abschnitt in variable zwischenspeichern (cachen)
		var $myMedia = $(this);

		// einzelne werte auslesen und zwischenspeichern
		// attribute: funktion 'attr()'
		// tags: nach dem tag suchen & text auslesen
		var type = $myMedia.attr("type");

		//console.debug("parse " + type);
		if (type == 'simple') {
			var shape = $myMedia.find('simple-shape').text();
			//Log("parse " + shape);

			// parse type1 objects
			if ((shape == 'rectangle') || (shape == 'round-rect') || (shape == 'circle') || (shape == 'line')) {
				// parse bounding rect
				var rect = $myMedia.find('rect').text();
				var rectFields = rect.split(',').map(Number);
				var tooltip = $myMedia.find('tooltip').text().trim();

/*
#ifdef USE_STEELSERIES
*/
				if (steelseriesSupport && tooltip.length && tooltip.substr(0, 11) == 'steelseries') {
					tooltip = tooltip.replace(new RegExp('\\r\\n', 'g'), '\n');
					var ttFields = tooltip.split('\n');
					ttFields.shift(); // sollte "steelseries" sein
					var ssObject = ttFields.shift(); // sollte der Objekttyp sein
					var ssProps = ttFields.join(',');

					var exprTextDisplay = [];
					var expr_text_display = $myMedia.find('text-display');
					if (expr_text_display.length) {
						exprTextDisplay = parseExpression(expr_text_display);
					}

					registerSteelSeries(
							rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
							ssObject,
							ssProps,
							exprTextDisplay
						);
				} else
/*
#endif
*/
				{
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
					var centerFields = center.split(',').map(Number);;

					// parse expression
					var exprToggleColor = [];
					var expr_toggle_color = $myMedia.find('expr-toggle-color');
					if (expr_toggle_color.length) {
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

					var exprInvisible = [];
					var expr_invisible = $myMedia.find('expr-invisible');
					if (expr_invisible.length) {
						exprInvisible = parseExpression(expr_invisible);
					}

					registerSimpleShape(
							shape,
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
							exprInvisible
						);

					parseTextInfo($myMedia, centerFields, rectFields, exprInvisible);

					parseClickInfo($myMedia, rectFields);

                    // parse Input Info
					var enableTextInput = $myMedia.find('enable-text-input').text();
					if (enableTextInput === 'true') {
					    // TODO: <text-input-type>0</text-input-type>

					    // in der <text-display> Expression findet sich die Zielvariable

					    // TODO: eigentlich w�re das eine Expression
					    //var exprTextDisplay = [];
					    //var expr_text_display = $myMedia.find('text-display');
					    //if (expr_text_display.length) {
					    //    exprTextDisplay = parseExpression(expr_text_display);
					    //}

					    var textDisplay = $myMedia.find('text-display');
					    variableName = '';
					    if (textDisplay.length) {
					        var textDisplayExpr = textDisplay.find('expr');
					        if (textDisplayExpr.length) {
					            variableName = textDisplayExpr.find('var').text();
					        }
					    }

					    rectFields[0] += parsedGroups[parsedGroups.length - 1].x;
						rectFields[1] += parsedGroups[parsedGroups.length - 1].y;
						rectFields[2] += parsedGroups[parsedGroups.length - 1].x;
						rectFields[3] += parsedGroups[parsedGroups.length - 1].y;

					    // TODO: "versteckter Text": <hidden-input>false</hidden-input>
						// TODO: "max len"
						// TODO: "min len"

						registerClickEdit(
							rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
							variableName
							);
					}
				}
			} else {
				Log("unknown simple-shape: " + shape);
			}
		} else if (type == 'bitmap') {
			//console.debug("register bitmap");
			var filename = $myMedia.find('file-name').text();
			var fileFields = filename.split('\\');
			filename = fileFields[fileFields.length - 1];
			var rect = $myMedia.find('rect').text();
			var rectFields = rect.split(',').map(Number);;
			var center = $myMedia.find('center').text();
			var centerFields = center.split(',').map(Number);;

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

			var exprInvisible = [];
			var expr_invisible = $myMedia.find('expr-invisible');
			if (expr_invisible.length) {
				exprInvisible = parseExpression(expr_invisible);
			}

			registerBitmap(
				rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
				filename,
				has_inside_color,
				"rgb(" + fill_color + ")",
				"rgb(" + fill_color_alarm + ")",
				has_frame_color,
				"rgb(" + frame_color + ")",
				"rgb(" + frame_color_alarm + ")",
				line_width,
				exprInvisible
				);

			parseTextInfo($myMedia, centerFields, rectFields, exprInvisible);

			parseClickInfo($myMedia, rectFields);
		} else if (type == 'button') {
			// #22: auch Buttons k�nnen eine Bitmap beherbergen
			var filename = $myMedia.find('file-name').text();
			if (filename.length) {
				var fileFields = filename.split('\\');
				filename = fileFields[fileFields.length - 1];
			}

			var rect = $myMedia.find('rect').text();
			var rectFields = rect.split(',').map(Number);;

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
			var centerFields = center.split(',').map(Number);;

			// parse expression
			// !!! TOGGLE VAR wird hier als TOGGLE COLOR verwendet !!!
			var exprToggleColor = [];
			var expr_toggle_color = $myMedia.find('expr-toggle-var');
			if (expr_toggle_color.length) {
				exprToggleColor = parseExpression(expr_toggle_color);
			}

			var exprInvisible = [];
			var expr_invisible = $myMedia.find('expr-invisible');
			if (expr_invisible.length) {
				exprInvisible = parseExpression(expr_invisible);
			}

			registerButton(
					rectFields[0], rectFields[1], rectFields[2] - rectFields[0], rectFields[3] - rectFields[1],
					has_frame_color,
					"rgb(" + frame_color + ")",
					"rgb(" + frame_color_alarm + ")",
					line_width,
					has_inside_color,
					"rgb(" + fill_color + ")",
					"rgb(" + fill_color_alarm + ")",
					exprToggleColor,
					exprInvisible,
					filename
				);

			parseTextInfo($myMedia, centerFields, rectFields, exprInvisible);

			parseClickInfo($myMedia, rectFields);
		} else if (type == 'polygon') {
			//console.debug("register polygon");

			var polyCount = parseInt($myMedia.find('poly-count').text());
			var polyShape = $myMedia.find('poly-shape').text();
			var points = [];
			$myMedia.find('point').each(function () {
				var val = $(this).text();
				points.push(val);
			})

			var center = $myMedia.find('center').text();
			var centerFields = center.split(',').map(Number);;

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

			// parse expression
			var exprToggleColor = [];
			var expr_toggle_color = $myMedia.find('expr-toggle-color');
			if (expr_toggle_color.length) {
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

			var exprInvisible = [];
			var expr_invisible = $myMedia.find('expr-invisible');
			if (expr_invisible.length) {
				exprInvisible = parseExpression(expr_invisible);
			}

			if ((polyShape == 'polygon') || (polyShape == 'polyline')) {
				registerPolygon(
						polyShape,
						points,
						has_frame_color,
						"rgb(" + frame_color + ")",
						"rgb(" + frame_color_alarm + ")",
						line_width,
						has_inside_color,
						"rgb(" + fill_color + ")",
						"rgb(" + fill_color_alarm + ")",
						exprToggleColor,
						exprLeft, exprTop,
						exprInvisible
					);
			} else {
				Log("unknown poly-shape: " + polyShape);
			}
		} else if (type == 'group') {
			//console.debug("register group");
			var rect = $myMedia.find('rect').text();
			var rectFields = rect.split(',').map(Number);

			var center = $myMedia.find('center').text();
			var centerFields = center.split(',').map(Number);

			registerGroup(rectFields[0], rectFields[1], rectFields[2], rectFields[3]);
			parsedGroups.push(new newGroup(rectFields[0], rectFields[1], rectFields[2], rectFields[3]));
			
			parse_visu_elements($myMedia);

			registerEndGroup();
			parsedGroups.pop();
		}
		else {
			Log("unknown type: " + type);
		}
	});
}

function load_dyntextfile_success(content) {

	$(content).find(">dynamic-text").each(function () {
		var $dynTextBlock = $(this);

		$dynTextBlock.find(">header").each(function () {
			var $header = $(this);

			visuDynTextDefaultLanguage = 'english';
			var defaultLanguage = $header.find('default-language').text();
			if (defaultLanguage.length) {
				visuDynTextDefaultLanguage = defaultLanguage;
			}

			// TODO: <default-font>
		});

		$dynTextBlock.find(">text-list").each(function () {
			var $textList = $(this);

			$textList.find(">text").each(function () {
				var $text = $(this);

				var prefix = $text.attr("prefix");
				var id = $text.attr("id");

				key = prefix + "_" + id;

				dynamicTexts[key] = {};

				$text.children().each(function () {
					var $child = $(this);

					var language = this.nodeName;
					var foreignText = $child.text();

					// Log('dynamicTexts['+prefix+']['+language+'] = '+foreignText);
					dynamicTexts[key][language] = foreignText;
				});
			});
		});
	});
}

// mit zip.js und inflate.js
function load_dyntextfile_compressed_success(content) {
	Log("dyntextfile is compressed - try to inflate");

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
				load_dyntextfile_success(xml);
			});
		});
	}, function(message) { 
		visuUseDynamicText = false;
		console.error(message); 
	});
}

function load_dyntextfile(filename) {
	Log("load dyntextfile " + filename);

	if (visuCompressed == 1) {
		$.ajax({
			type: 'GET',
			async: false,
			cache: false,
			url: filename,
			dataType: 'blob', // mit zip.js und inflate.js
			success: load_dyntextfile_compressed_success,
			error: function (jqXHR, textStatus, errorThrown) {
				visuUseDynamicText = false;
				Log("ERROR: load_dyntextfile " + textStatus + " " + errorThrown);
			}
		});
	} else {
		$.ajax({
			type: 'GET',
			async: false,
			cache: false,
			url: filename,
			success: load_dyntextfile_success,
			error: function (jqXHR, textStatus, errorThrown) {
				visuUseDynamicText = false;
				Log("ERROR: load_dyntextfile " + textStatus + " " + errorThrown);
			}
		});
	}
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
				Log("load_visu " + textStatus + " " + errorThrown);
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
				Log("load_visu " + textStatus + " " + errorThrown);
			}
		});
	}
}

// holt Aktualisierungen f�r alle bekannten Variablen vom webserver
function update_vars_std() {
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

	//Log("update_vars");
	//Log("REQ = " + req);

	$.ajax({
		type: 'POST',
		//async: false,
		async: true,
		url: postUrl,
		data: req,
		success: function (data) {
			//Log("ANS = " + data);
			var fields = data.split('|');
			var count = 1; // split z�hlt bereits vor dem ersten trenner
			$.each(visuVariables, function (key, obj) {
				//Log("TYPE = " + obj.varType + "; ANS = " + fields[count]);
				switch (obj.varType) {
					case VAR_TYPE_REAL:
					case VAR_TYPE_LREAL:
						obj.value = parseFloat(fields[count]);
						break;

					//case VAR_TYPE_BOOL:
					//case VAR_TYPE_INT:
					//case VAR_TYPE_BYTE:
					//case VAR_TYPE_WORD:
					//case VAR_TYPE_DINT:
					//case VAR_TYPE_DWORD:

					case VAR_TYPE_TIME:
						try {
							value = parseInt(fields[count]);
							ms = value % 1000;
							value /= 1000;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							s = value % 60;
							value /= 60;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							m = value % 60;
							value /= 60;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							h = value;

							obj.value = "T#" + h + "h" + m + "m" + s + "s" + ms + "ms";
						} catch (e) {
							Log("time " + fields[count] + " error: " + e.name);
						}
						break;


					//case VAR_TYPE_STRING:
					//case VAR_TYPE_ARRAY:
					//case VAR_TYPE_ENUM:
					//case VAR_TYPE_USERDEF:
					//case VAR_TYPE_BITORBYTE:
					//case VAR_TYPE_POINTER:
					//case VAR_TYPE_SINT:
					//case VAR_TYPE_USINT:
					//case VAR_TYPE_UINT:
					//case VAR_TYPE_UDINT:
					case VAR_TYPE_DATE:
						try {
							//Log("try to decode date " + fields[count]);
							var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
							var tzo = new Date().getTimezoneOffset() * 60;
							d.setUTCSeconds(parseInt(fields[count]) + tzo);
							obj.value = d.toLocaleDateString()
						} catch (e) {
							Log("date " + fields[count] + " error: " + e.name);
						}
						break;

					case VAR_TYPE_TOD:
						try {
							value = parseInt(fields[count]);
							ms = value % 1000;
							value /= 1000;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							s = value % 60;
							value /= 60;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							m = value % 60;
							value /= 60;
							value |= 0; // All bitwise operations work on signed 32-bit integers. Using them converts a float to an integer. 
							h = value;

							obj.value = "TOD#" + h + ":" + m + ":" + s + "." + ms;
						} catch (e) {
							Log("time of day " + fields[count] + " error: " + e.name);
						}
						break;

					case VAR_TYPE_DT:
						try {
							//Log("try to decode date " + fields[count]);
							var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
							var tzo = new Date().getTimezoneOffset() * 60;
							d.setUTCSeconds(parseInt(fields[count]) + tzo);
							obj.value = d.toLocaleDateString() + " " + d.toLocaleTimeString();
						} catch (e) {
							Log("datetime " + fields[count] + " error: " + e.name);
						}
						break;

					//case VAR_TYPE_VOID:
					//case VAR_TYPE_REF:
					//case VAR_TYPE_NONE:
					default:
						if (obj.numBytes == 1) {
							obj.value = fields[count] & 0xFF;
						} else if (obj.numBytes == 2) {
							obj.value = fields[count] & 0xFFFF;
						} else if (obj.numBytes == 4) {
							obj.value = fields[count] & 0xFFFFFFFF;
						} else {
							obj.value = fields[count];
						}
						break;
				}
				count++;
			});

/*
#ifdef USE_STEELSERIES
*/
			for (var i in canvObjects) {
				co = canvObjects[i];
				if (co.exprTextDisplay.length > 0) {
					var textDisplay = 0;
					textDisplay = evalExpression(co.exprTextDisplay);
					//co.ssobj.setValueAnimated(textDisplay);
					co.ssobj.setValue(textDisplay);
				}
			}
/*
#endif
*/

			perfUpdateEnd = new Date().getTime();
			perfUpdate = perfUpdateEnd - perfUpdateStart;
			//Log("update_vars finished in " + perfUpdate + "ms");
		}
	});
}

/*
Um Flash-Speicherplatz zu sparen verwenden wir keine vollst�ndige SOAP-Library
sondern basteln unseren Request selbst zusammen
*/
function update_vars_soap() {
	if (perfUpdateStart > perfUpdateEnd)
		return;

	perfUpdateStart = new Date().getTime();

	var requestString =
		'<?xml version="1.0" encoding="ISO-8859-1"?>'
		+ '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
		+ '<soap:Body>'
		+ '<Read xmlns="http://opcfoundation.org/webservices/XMLDA/1.0/">'
		+ '<Options ReturnItemTime="true" ReturnItemName="true" ClientRequestHandle="" LocaleID="en-US" />'
		+ '<ItemList>'
		+ '<Items ItemPath="" ItemName="PLC1.CurrentWriteAccessClientId" ClientItemHandle="" />'
		+ '<Items ItemPath="" ItemName="PLC1.CurrentLanguage" ClientItemHandle="" />'
		+ '<Items ItemPath="" ItemName="PLC1.CurrentCaller" ClientItemHandle="" />'
		+ '<Items ItemPath="" ItemName="PLC1.CurrentVisu" ClientItemHandle="" />'
	;

	var variables = {};

	$.each(visuVariables, function (key, obj) {
		var objName = obj.name;
		// es muss ein "PLC1." vorangestellt werden / sein
		if (objName.substr(0, 4) != 'PLC1.') {
			if (objName.substr(0, 1) == '.') {
				objName = 'PLC1' + objName
			} else {
				objName = 'PLC1.' + objName
			}
		}
		variables[objName] = obj;
		requestString += '<Items ItemPath="" ItemName="'
		requestString += objName
		requestString += '" ClientItemHandle="" />'
	});

	requestString +=
		'</ItemList>'
		+ '</Read>'
		+ '</soap:Body>'
		+ '</soap:Envelope>'
	;

	//Log("update_vars_soap");
	//Log("REQUEST= " + requestString);

	$.ajax({
		type: 'POST',
		//async: false,
		async: true,
		url: postUrl,
		data: requestString,
		success: function (data) {
			// "data" sollte bereits als XML ankommen...

			// Beim Parsen mit Namespace muss in jQuery der Doppelpunkt (mit Backslash) escaped werden.
			// Der Backslash muss bei JQuery ankommen - deshalb Doppelt-Backslash
			// ns1:Items => ns1\\:Items
			$(data).find("ns1\\:Items").each(function () {
				var $item = $(this);

				var itemName = $item.attr("ItemName");

				var valueElement = $item.children('ns1\\:Value');
				var valueType = valueElement.attr("xsi:type");
				var value = valueElement.text();

				//Log("ITEM= " + itemName + " type= " + valueType + " value= " + value);

				obj = variables[itemName];
				if (obj != null) {
					switch (obj.varType) {
						case VAR_TYPE_REAL:
						case VAR_TYPE_LREAL:
							obj.value = parseFloat(value);
							break;

						case VAR_TYPE_BOOL:
							if (value == "true") {
								obj.value = 1;
							} else {
								obj.value = 0;
							}
							break;

						case VAR_TYPE_STRING:
							obj.value = value;
							break;

							//case VAR_TYPE_INT:
							//case VAR_TYPE_BYTE:
							//case VAR_TYPE_WORD:
							//case VAR_TYPE_DINT:
							//case VAR_TYPE_DWORD:
							//case VAR_TYPE_TIME:
							//case VAR_TYPE_ARRAY:
							//case VAR_TYPE_ENUM:
							//case VAR_TYPE_USERDEF:
							//case VAR_TYPE_BITORBYTE:
							//case VAR_TYPE_POINTER:
							//case VAR_TYPE_SINT:
							//case VAR_TYPE_USINT:
							//case VAR_TYPE_UINT:
							//case VAR_TYPE_UDINT:
							//case VAR_TYPE_DATE:
							//case VAR_TYPE_TOD:

						case VAR_TYPE_DT:
							try {
								//Log("try to decode date " + value);
								var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
								d.setSeconds(parseInt(value));
								obj.value = d.toLocaleDateString() + " " + d.toLocaleTimeString();
							} catch (e) {
								Log("date " + value + " error: " + e.name);
							}
							break;

							//case VAR_TYPE_VOID:
							//case VAR_TYPE_REF:
							//case VAR_TYPE_NONE:

						default:
							if (obj.numBytes == 1) {
								obj.value = value & 0xFF;
							} else if (obj.numBytes == 2) {
								obj.value = value & 0xFFFF;
							} else if (obj.numBytes == 4) {
								obj.value = value & 0xFFFFFFFF;
							} else {
								obj.value = value;
							}
							break;
					}
				}
			});

			perfUpdateEnd = new Date().getTime();
			perfUpdate = perfUpdateEnd - perfUpdateStart;
		}
	});

}

// holt Aktualisierungen f�r alle bekannten Variablen vom webserver
function update_vars() {
	if (postFormat == POST_FORMAT_STANDARD) {
		return update_vars_std();
	} else if (postFormat == POST_FORMAT_SOAP) {
		return update_vars_soap();
	}
}

function pointerEventToXY(e) {
	var out = { x: 0, y: 0 };
	if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		out.x = touch.pageX;
		out.y = touch.pageY;
	} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
		out.x = e.pageX;
		out.y = e.pageY;
	}
	return out;
};

function onInputFieldKeyPressed(event, fieldName, variableName) {
    // ESC + ENTER behandeln wir selbst
    if (event.which == 27 || event.keyCode == 27) {
        // ESC: Feld einfach schlie�en
        var input = document.getElementById(fieldName);
        var parent = document.getElementById("contain");

        parent.removeChild(input);

        inputFieldActive = false;
        return false;
    } else if (event.which == 13 || event.keyCode == 13) {
        // ENTER: Wert �bernehmen und Feld schlie�en
		var input = document.getElementById(fieldName);
		var parent = document.getElementById("contain");

		newval = input.value;
		parent.removeChild(input);

		//Log("SET " + variableName + " = " + newval);

		var req = '|1|1|0|' + visuVariables[variableName].addrP + '|' + newval + '|';

		$.ajax({
			type: 'POST',
			async: false,
			url: postUrl,
			data: req,
		});

		visuVariables[variableName].value = newval;
		update();

		inputFieldActive = false;
		return false;
	}

    // alle anderen Tasten lassen wir vom Browser handeln
	return true;
}


// der Click-Handler
function onClick( e ) {
	var x = e.pageX-$("#canvas").offset().left;
	var y = e.pageY - $("#canvas").offset().top;
	Log("onClick");
	logOverlayText += "onClick\n";
	//Log("X " + e.pageX + " Y " + e.pageY);
	//Log("X " + x + " Y " + y);

	if (inputFieldActive == true) {
	    // wir akzeptieren keine Klicks solange ein Inputfeld aktiv ist
	    Log("inputFieldActive - exiting");
	    return;
	}

	for (var i in clickRegions) {
		obj = clickRegions[i];

		//Log("obj.x " + obj.x + " obj.y " + obj.y + " (obj.x+obj.w) " + (obj.x + obj.w) + " (obj.y+obj.h) " + (obj.y + obj.h));

		if (obj.isA == 'Toggle') {
			if ((obj.x <= x) && (obj.y <= y) && ((obj.x + obj.w) >= x) && ((obj.y + obj.h) >= y)) {
				//Log("onClick: found toggle: " + obj.variable);
				if (obj.variable != '') {
					var newval = 1 - visuVariables[obj.variable].value;
					var req = '|1|1|0|' + visuVariables[obj.variable].addrP + '|' + newval + '|';

					$.ajax({
						type: 'POST',
						async: false,
						url: postUrl,
						data: req,
						//success: function( data ) {
						//	Log("success: " + data);
						//}
					});

					visuVariables[obj.variable].value = newval;
					update();
				}
				return;
			}
		} else if (obj.isA == 'Zoom') {
			if ((obj.x <= x) && (obj.y <= y) && ((obj.x + obj.w) >= x) && ((obj.y + obj.h) >= y)) {
				switchToVisu(obj.visu);
				return;
			}
		} else if (obj.isA == 'Edit') {
		    if ((obj.x <= x) && (obj.y <= y) && ((obj.x + obj.w) >= x) && ((obj.y + obj.h) >= y)) {
		        // Wir erzeugen (tempor�r) ein HTML-Input-Field
		        // dieses lassen wir komplett vom Browser bedienen, bie ENTER grdr�ckt wird
		        // als Callback f�r Tastendr�cke geben wir "onInputFieldKeyPressed" an.
		        var input = document.createElement('input');
		        input.setAttribute('type', 'text');
		        input.setAttribute('id', 'inputField');
		        strStyle = 'z-index:2; position:absolute; box-sizing:border-box; ';
		        strStyle += 'top:' + obj.y + 'px; ';
		        strStyle += 'left:' + obj.x + 'px; ';

		        /* TODO:
                 * https://www.w3schools.com/TAGs/tag_input.asp
                 * height geht nicht f�r "input text", sondern nur f�r "input image"
                 * width geht nicht f�r "input text", sondern nur f�r "input image"
                 * min/max
                 * maxlength
                 * pattern
                 * size
                 */
		        strStyle += 'width:' + obj.w + 'px; ';
		        strStyle += 'heigth:' + obj.h + 'px; ';

		        input.setAttribute('style', strStyle);
		        input.setAttribute('value', visuVariables[obj.variable].value);
		        input.setAttribute('onkeypress', "return onInputFieldKeyPressed(event, 'inputField', '" + obj.variable + "')");

		        var parent = document.getElementById("contain");
		        parent.appendChild(input);

		        input.focus();
		        input.select();

		        inputFieldActive = true;
		        return;
		    }
		}
	}
}

// der MouseDown-Handler
function onMouseDown(e) {
	//var x = e.pageX - $("#canvas").offset().left;
	//var y = e.pageY - $("#canvas").offset().top;
	var pos = pointerEventToXY(e);
	var x = pos.x;
	var y = pos.y;

	Log("onMouseDown");
	Log("X " + x + " Y " + y);

	if (inputFieldActive == true) {
	    // wir akzeptieren keine Klicks solange ein Inputfeld aktiv ist
	    Log("inputFieldActive - exiting");
	    return;
	}

	// ein neuer MouseDown hatte sicherlich einen MouseUp voran - nur, falls der verloren ging
	// passiert komischerweise ab und zu bei Firefox
	HandlePendingMouseUps();

	for (var i in clickRegions) {
		obj = clickRegions[i];

		//Log("obj.x " + obj.x + " obj.y " + obj.y + " (obj.x+obj.w) " + (obj.x + obj.w) + " (obj.y+obj.h) " + (obj.y + obj.h));

		if (obj.isA == 'Tap') {
			if ((obj.x <= x) && (obj.y <= y) && (obj.x + obj.w >= x) && (obj.y + obj.h >= y)) {
				PendingMouseUpObjects.push(obj);
				if (obj.variable != '') {
					var newval = obj.newval;
					var req = '|1|1|0|' + visuVariables[obj.variable].addrP + '|' + newval + '|';

					$.ajax({
						type: 'POST',
						async: false,
						url: postUrl,
						data: req,
					});

					visuVariables[obj.variable].value = newval;
					update();
				}
				return;
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
				url: postUrl,
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
    Log("onMouseUp");

    if (inputFieldActive == true) {
        // wir akzeptieren keine Klicks solange ein Inputfeld aktiv ist
        Log("inputFieldActive - exiting");
        return;
    }

	HandlePendingMouseUps();
}


