// Tim's mapping functions
// Timothy C. Barmann
// tbarmann@providencejournal.com
// 11/16/2010
// last revision 5/26/2015

// now requires underscore.js
// removed functions that were duplicated in underscore.js
// rewrote to initialized all fields at the start
// 'field' is no longer a global
// json data array is indexed at initialization for speed
// settings object now holds key settings
// defaults can be set for the whole app and for individual fields
// Tooltips can display custom strings using underscore template
// Each field's legend can have a header and a footer
// Fields array now optional. It is created automatically if it doesn't exist.
// 5/26/2015 - contains working rotate function

//////////////////////////////////////////////////////////////////////////////////////
// IE doesn't have Array.map, so this adds it
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        res[i] = fun.call(thisp, t[i], i, t);
    }

    return res;
  };
}
//////////////////////////////////////////////////////////////////////////////////////
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
//////////////////////////////////////////////////////////////////////////////////////
String.prototype.replaceSpacesLowerCase = function() {
	var str = this.replace(/\s/g, '_');
	str = str.toLowerCase();
	return str;
};

//////////////////////////////////////////////////////////////////////////////////////
String.prototype.restoreSpaces = function()
{
	var str = this.replace(/_/g, ' ');
   // return str.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); });
	return str;
}


//////////////////////////////////////////////////////////////////////////////////////
function generateColor(ranges) {
            if (!ranges) {
                ranges = [
                    [150,256],
                    [50, 190],
                    [50, 256]
                ];
            }
            var g = function() {
                //select random range and remove
                var range = ranges.splice(Math.floor(Math.random()*ranges.length), 1)[0];
                //pick a random number from within the range
                return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
            }
            var rgb = {};
            rgb.r = g();
            rgb.g = g();
            rgb.b = g();

            return '' + ColorObjToHex(rgb);
}


//////////////////////////////////////////////////////////////////////////////////////
function isMapable(index) {
	if (map_init.fields[index].hasOwnProperty('mapable')) {
		if (map_init.fields[index].mapable === true){
			return true;
		}
	}
	return false;
}

//////////////////////////////////////////////////////////////////////////////////////

function mixPalette(start_hex,end_hex,steps) {

//	globals: none

	var step = {};
	var start_rgb = hexToRGB(start_hex);
	var end_rgb = hexToRGB(end_hex);
	var palette = [];


	var denominator = (steps<2) ? 1 : steps-1;

	step.r = (end_rgb.r - start_rgb.r) / denominator;
	step.g = (end_rgb.g - start_rgb.g) / denominator;
	step.b = (end_rgb.b - start_rgb.b) / denominator;

	for (var i = 0; i < steps; i++) {
		var this_rgb = {};
		this_rgb.r = start_rgb.r + (step.r * i);
		this_rgb.g = start_rgb.g + (step.g * i);
		this_rgb.b = start_rgb.b + (step.b * i);
		palette.push(ColorObjToHex(this_rgb));
	}

	return palette;

}

//////////////////////////////////////////////////////////////////////////////////////
function hexToRGB (color_str) {
	color_str = color_str.toUpperCase();
	color_str = color_str.replace(/[\#rgb\(]*/,'');
	if (color_str.length == 3) {
		var r = color_str.substr(0,1);
		var g = color_str.substr(1,1);
		var b = color_str.substr(2,1);
		color_str = r + r + g + g + b + b;
	}
	var red_hex = color_str.substr(0,2);
	var green_hex = color_str.substr(2,2);
	var blue_hex = color_str.substr(4,2);
	var this_color = {};
	this_color.r = parseInt(red_hex,16);
	this_color.g = parseInt(green_hex,16);
	this_color.b = parseInt(blue_hex,16);

	return this_color;
}


//////////////////////////////////////////////////////////////////////////////////////
function ColorObjToHex (rgb) {

	var r = (parseInt(rgb.r,10)).toString(16);
	var g = (parseInt(rgb.g,10)).toString(16);
	var b = (parseInt(rgb.b,10)).toString(16);

	r= (r.length == 1) ? '0' + r : r;
	g= (g.length == 1) ? '0' + g : g;
	b= (b.length == 1) ? '0' + b : b;

	return (r+g+b).toUpperCase();

}

//////////////////////////////////////////////////////////////////////////////////////
function RGBStrToHex(str) {

	// this converts an RGB string to a hex color:
	// rgb(229,245,249) --> e5f5f9
	var a = str.split("(")[1].split(")")[0];
	a = a.split(",");

	// Convert the single numbers to hex
	var b = a.map(function(x){             //For each array element
	    x = parseInt(x).toString(16);      //Convert to a base16 string
	    return (x.length==1) ? "0"+x : x;  //Add zero if we get only one character
	})
	// Glue it back together:

	return b.join("");

}
//////////////////////////////////////////////////////////////////////////////////////
	function viewport() {
		var e = window, a = 'inner';
		if ( !( 'innerWidth' in window ) ) {
			a = 'client';
			e = document.documentElement || document.body;
		}
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
	}

//////////////////////////////////////////////////////////////////////////////////////
function mapResizePct(pct) {

	$("area").each (function (i) {

	// get the coordinate pairs for this polygon area and put them in an array
	var coordStr = $(this).attr('coords');
	var coordArry = coordStr.split(',');

	for (var x=0;x<coordArry.length;x++) {
		coordArry[x] = Math.round(coordArry[x] * pct);
	}

	coordStr = coordArry.join();
	$(this).attr('coords',coordStr);
	});
}


//////////////////////////////////////////////////////////////////////////////////////
function mapResizeWidth(width) {

	if (width === undefined) {
		if (!map_init.hasOwnProperty('map_width')) {
			console.log("mapResizeWidth(): no width found.")
			return;
		}
		var width = map_init.map_width;
	}

	var maxXY = getMaxXY("area");
	var pct = width/maxXY.x;
	mapResizePct(pct);

}

//////////////////////////////////////////////////////////////////////////////////////

function resizeImage(img_selector) {
	var area_selector = $(img_selector).attr("usemap");
	var maxXY = getMaxXY(area_selector + " area");
	$(img_selector).width(maxXY.x).attr('width',maxXY.x);
	$(img_selector).height(maxXY.y).attr('height',maxXY.y);;
}
//////////////////////////////////////////////////////////////////////////////////////
function imageMapTrim(img_selector) {
	// shifts image map coordinates to 0,0 to elimnate empty space
	// on the top and left

	var area_selector = $(img_selector).attr("usemap");
	var minXY = getMinXY(area_selector + " area");
	moveImageMap(img_selector,minXY.x*-1,minXY.y*-1);

}

//////////////////////////////////////////////////////////////////////////////////////
function moveImageMap(img_selector,x_offset,y_offset) {

	var area_selector = $(img_selector).attr("usemap");
	$("map" + area_selector + " area").each(function(){
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');
		for (var x=0;x<coordArry.length;x+=2) {
			coordArry[x]*=1;
			coordArry[x+1]*=1;
			coordArry[x]+= parseInt(x_offset);
			coordArry[x+1]+= parseInt(y_offset);
		}
		coordStr = coordArry.join();
		$(this).attr('coords',coordStr);
	});

}




//////////////////////////////////////////////////////////////////////////////////////
function locDataLookup(location,field_index) {

// globals: map_init

	if (map_init.fields.length<1) {
		return;
	}

	if (map_init.hasOwnProperty("indexed_data")) {
		var this_data_obj = map_init.indexed_data[location.replaceSpacesLowerCase()];
		var map_field_name = map_init.fields[field_index].name;
		var this_data = this_data_obj[map_field_name];
		return this_data;
	}

	return "No data for " + location;
}


//////////////////////////////////////////////////////////////////////////////////////
// Point object
function Point(x,y) {
  this.x=x;
  this.y=y;
}

//////////////////////////////////////////////////////////////////////////////////////
// Contour object
function Contour(a) {
  this.pts = []; // an array of Point objects defining the contour
}
// ...add points to the contour...

//////////////////////////////////////////////////////////////////////////////////////
Contour.prototype.area = function() {
  var area=0;
  var pts = this.pts;
  var nPts = pts.length;
  var j=nPts-1;
  var p1; var p2;

  for (var i=0;i<nPts;j=i++) {
     p1=pts[i]; p2=pts[j];
     area+=p1.x*p2.y;
     area-=p1.y*p2.x;
  }
  area/=2;
  return area;
};

//////////////////////////////////////////////////////////////////////////////////////
Contour.prototype.centroid = function() {
  var pts = this.pts;
  var nPts = pts.length;
  var x=0; var y=0;
  var f;
  var j=nPts-1;
  var p1; var p2;

  for (var i=0;i<nPts;j=i++) {
     p1=pts[i]; p2=pts[j];
     f=p1.x*p2.y-p2.x*p1.y;
     x+=(p1.x+p2.x)*f;
     y+=(p1.y+p2.y)*f;
  }

  f=this.area()*6;
  return new Point(parseInt(x/f),parseInt(y/f));
};


//////////////////////////////////////////////////////////////////////////////////////
function shrinkArea(area,pct) {


	var minXY = getMinXY(area);

	var coordStr = $(area).attr('coords');
	var coordArry = coordStr.split(',');
	var newCoordStr = "";

	for (var j=0;j<coordArry.length;j+=2) {
		var x = parseInt(((coordArry[j] - minXY.x)*pct) + minXY.x);
		var y = parseInt(((coordArry[j+1] - minXY.y)*pct) + minXY.y);
		if (newCoordStr.length > 0) {
			newCoordStr += ", ";

		}
		newCoordStr += x + "," + y;
	}

	$(area).first().attr('coords',newCoordStr);
}




//////////////////////////////////////////////////////////////////////////////////////
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


//////////////////////////////////////////////////////////////////////////////////////
function getLegendStep(target,field_index) {
// given a target value, searches through all datasource values of a particular field
// and figures out which step the target value belongs
// globals: datasource, map_init.fields, steps, map_init

	var delimiter = (typeof target === "string") ? "'" : "";

	field = map_init.fields[field_index];

	if (field.type==="string") {
		for (var x=0;x<field.values.length;x++) {
			if (field.values[x]==target) {
				return x;
			}
		}
	console.log ("Warning: Target in unique values not found: " + delimiter + target + delimiter);
	return null;
	}
	else {
		for (var index=0; index<field.boundaries.length; index++) {
			if ((target >= field.boundaries[index]['lower']) && (target <= field.boundaries[index]['upper'])) {
				return index;
			}
		}

	console.log ("Warning: Target in boundaries array not found: " + delimiter + target + delimiter);
	return null;
	}

}

//////////////////////////////////////////////////////////////////////////////////////
function extractLoc(thisOnMouseOverStr) {
	// Extract the parameter - this is the location name
	var thisOnMouseOverArray = thisOnMouseOverStr.split("'");
	var loc = thisOnMouseOverArray[1];
//	loc = loc.replaceSpacesLowerCase();
	return loc;

}


//////////////////////////////////////////////////////////////////////////////////////
function isEven(x) { return (x%2)?false:true; }
function isOdd(x) { return (x%2)?true:false; }


//////////////////////////////////////////////////////////////////////////////////////
function mapOnMouseOver(loc){

	var index = loc.replaceSpacesLowerCase();
	
	if (!map_init.hasOwnProperty("indexed_data")) {
		console.log("mapOnMouseOver(): no indexed data found.");
		return;
	}

	var data = map_init.indexed_data[index];
	var heading = "";
	var footer = "";

	if (map_init.settings.tooltip_heading.trim().length>0) {
		var tmp = _.template(map_init.settings.tooltip_heading);
		heading = tmp(data);
	}
	else if (map_init.hasOwnProperty('join_field_label')) {
		heading = map_init.join_field_label + ': ' + loc;
	}
	else {
		heading = loc;
	}
	if (map_init.settings.tooltip_footer.trim().length>0) {
		var tmp = _.template(map_init.settings.tooltip_footer);
		footer = tmp(data);
	}

	var html = '<table class="tip_table">';
	html +='<tr>';
	html +='<td colspan="2">';
	html += '<div class="label_loc">' + heading + '</div>';
	html += '</td></tr>';
	for (var field_index = 0; field_index<map_init.fields.length; field_index++) {
		if (map_init.fields[field_index].tooltip === false) {
			continue;
		}

		var field_name = map_init.fields[field_index].name;
		html+='<tr';
		if (isEven(field_index))
			html += ' class="even"';
		html+='>';
		html +='<td>';
		html +=map_init.fields[field_index].label;
		html +='</td>';
		html +='<td>';


		var field_value = (data===undefined) ? "No data" : data[field_name];

		if (map_init.fields[field_index].hasOwnProperty('format')===true && $.isNumeric(field_value)) {
			field_value = field_value.format((map_init.fields[field_index].format));
		}
		html += field_value;
		html += '</td></tr>';
	}
	if (footer.length) {

			html +='<tr>';
			html +='<td colspan="2">';
			html += '<div class="tooltip_footer">' + footer + '</div>';
			html += '</td></tr>';
	}
	html += '</table>';
	Tip(html);
}



//////////////////////////////////////////////////////////////////////////////////////
function buildLegend (field_index) {

	// global objects: map_init, map_init.fields

	if (map_init.fields.length<1) {
		// no fields, no legend needed
		return;

	}

	if (field_index === undefined) {
		var field_index = getFieldIndexByName(map_init.initial_field);
	}
	
	var field = map_init.fields[field_index];
	var columns = parseInt(field.legend_columns);

	var rows = Math.ceil(field.steps/columns);
	var colspan = 2 * columns;

	var html='<div id="legend">';

	html += field.hasOwnProperty('legend_header') ? '<div id="legend_header">' + field.legend_header + '</div>' : '';


	html += '<table class="map_legend">';
	html += '<tr><td colspan="' + colspan + '"><div class="legend_heading">' + field.label + '</div></td></tr>';

	var index = 0;
	for (var row=0; row < rows; row++) {
		html +='<tr>';
		for (var col=0; col < columns; col++) {
			if(index >= field.steps){
				html +="<td>&nbsp;</td><td>&nbsp;</td>";
				continue; // if there is no value for this index, add empty cells and continue on to the next column
			}
			if  (field.type==="string") {
				if ($.isNumeric(field.values[index])) {
					var desc = parseFloat(field.values[index]);
					desc = desc.format(field.format);
				}
				else {
					desc = field.values[index].restoreSpaces();

				}
			}
			else {
				var lower_range = field.boundaries[index]['lower'];
				var upper_range = field.boundaries[index]['upper'];
				if (upper_range == Infinity) {
					var desc = '&gt;= ' + lower_range.format(field.format);
				}
				else if (lower_range == -Infinity) {
					var desc = '' + upper_range.format(field.format);
				}
				else if (lower_range === upper_range) {
					var desc = lower_range.format(field.format);
				}
				else {
				var desc = lower_range.format(field.format) + ' to ' + upper_range.format(field.format);
				}
			}
			mouseOverStr  = 'onMouseOver="highlight_areas(\'step_' + index + '\');"';
			mouseOverStr += ' onMouseOut="unhighlight_areas(\'step_' + index + '\');"';

			html +='<td><div class="color_box" ' + mouseOverStr + ' style="background:#' + getPaletteColor(field_index,index) + ';">&nbsp;</div></td>';
			html +='<td>' + desc +  '</td>';
			index++;
		}
		html +='</tr>';
	}

	html +='</table>';
	html += field.hasOwnProperty('legend_footer') ? '<div id="legend_footer">' + field.legend_footer + '</div>' : '';
	html += '</div>';


	$('.legend_div').html(html);

	$('.legend_div').width($('.map_legend').width());

	// place legend div
	var cssObj = {};
	cssObj[map_init.settings.legend_h_offset_type] = map_init.settings.legend_h_offset;
	cssObj.top = map_init.settings.legend_v_offset;
	cssObj['z-index'] = 1;
	cssObj.position = "absolute";

	$('.legend_div').css(cssObj);



	return;
}
//////////////////////////////////////////////////////////////////////////////////////
function indexData() {
	
	if (!map_init.hasOwnProperty("datasource")) {
		return;
	}

	// creates an indexed array of the map data
	// and attaches it to global object map_init
	// the index is based on the join field value,
	// converted to lowercase and spaces replaced with underscores
	// to speed up access
	var data = map_init.datasource;
	var join_field = map_init.join_field;
	$.each(data,function(){
		var value = this[join_field];

		this.index = value.replaceSpacesLowerCase();
	});
	// index the data by the geo field to make it faster to search	
	map_init.indexed_data = _.indexBy(map_init.datasource, 'index');


}
//////////////////////////////////////////////////////////////////////////////////////
function initApp () {
	
	indexData();

	var app_defaults = {
		"polygon_border_color":"FFFFFF",
		"tooltip_heading": "",
		"tooltip_footer": "",
		"color_no_data":"AAAAAA",
		"fill_opacity_no_data":1,
		"stroke_width_no_data":1,
		"stroke_color_no_data":"FFFFFF",
		"show_map_chooser":true,
		"label_map":true,
		"legend_h_offset_type": "left",
		"legend_h_offset": 0,
		"legend_v_offset": 0,
		"show_datatable":true,
		"map_rotation_degrees" : 0
	}
	map_init.settings = $.extend({},app_defaults,map_init.settings);


}

//////////////////////////////////////////////////////////////////////////////////////
function initFields () {
	// if the field does not have a label property, add one using the field's name
	// global objects: map_init, map_init.fields

	
	var field_defaults = {
			"mapable":true,
			"palette": ["#f7c19e", "#88b0f7", "#b1e2bb", "#FF2C00"],
			"steps":4,
			"start_color" :"#f7c19e",
			"end_color" : "#FF2C00",
			"type": "number",
			"legend_columns" : 1,
			"tooltip": true
	};

	if (typeof(map_init.fields) === 'undefined') {

		// create array called fields
		map_init.fields = new Array();
	}
	if (typeof(map_init.datasource) === 'undefined') {
		console.log("Warning: Data source has not been defined.");
		return;
	}

	if (map_init.fields.length < 1) {

		var props = _.keys(map_init.datasource[0]);
		for (var index=0; index<props.length; index++) {
			map_init.fields[index] = {"name": props[index]};
		}
		// assuming the first field is the join field,
		// set it's mapable property to false 
		map_init.fields[0].mapable = false;
	}

	// at this point, we know there is a fields array
	// and each array element has, at least, a "name" property
	// fill in the rest of the needed properties

	for (var index=0; index< map_init.fields.length; index++) {

		if (!map_init.fields[index].hasOwnProperty('label')) {
				map_init.fields[index].label = map_init.fields[index].name;
		}
		var settings = $.extend({},field_defaults,map_init.field_defaults);
		$.extend(settings,map_init.fields[index]);
		$.extend(map_init.fields[index],settings);
		
		if (map_init.fields[index].mapable) {
			initPalette(index);
			setStepBounds(index);
		}
	} // for
	
}
//////////////////////////////////////////////////////////////////////////////////////
function initPalette(index) {

	var thisField = map_init.fields[index];
	// if has a palette array, it has to have more than 1 element
	if (!$.isArray(thisField.palette) || thisField.palette.length<2) {
		thisField.palette = [];
		if (thisField.type == 'string') {
			for (var x=0;x<thisField.steps;x++) {
				thisField.palette[x] = generateColor();
			}
		}
		else {
			thisField.type = 'number';
			thisField.palette = mixPalette(thisField.start_color,thisField.end_color,thisField.steps);
		}
	}
	// get rid of the '#' before a color value, convert RGB to Hex if necessary
	thisField.steps = thisField.palette.length;
	$.each(thisField.palette,function(index){
		thisField.palette[index] = this.replace('#','');
		if (this.toUpperCase().indexOf("RGB") !== -1) {
			thisField.palette[i]=RGBStrToHex(this);
			}
	});

}

//////////////////////////////////////////////////////////////////////////////////////
function setStepBounds (index) {

	// global objects: map_init,map_init.fields

	var thisField = map_init.fields[index];

	// if the field type is string, the number of steps = the number of unique values for that field
	// get all the unique values, sorted, and save them to be used to build
	// the legend - buildLegend(), and then return. No need to determine boundaries.
	if (thisField.type === 'string') {
		if (!thisField.hasOwnProperty('values')) {
			thisField.values = _.uniq(_.pluck(map_init.datasource,thisField.name));
			thisField.steps = thisField.values.length;
			return;
		}
	}
	
	// Find out how many steps.

	// if the boundaries have already been set by the user in the field definition, just set the steps
	// and return. No need to classify.

	if (thisField.hasOwnProperty('boundaries')) {
		thisField.steps = thisField.boundaries.length;
		return;

	}

	// no boundaries set yet
	// now classify

	// get min and max values for this field
	var max = Math.ceil(_.max(_.pluck(map_init.datasource,thisField.name))) + 1; // adding 1 ensures that target will be < max
	var min = Math.floor(_.min(_.pluck(map_init.datasource,thisField.name)));
	var range = max-min;

	thisField.max_value = max;
	thisField.min_value = min;


	if (thisField.hasOwnProperty('interval')) {
			thisField.steps =  Math.ceil(range/thisField.interval);
	}
	else {
		thisField.interval = range/thisField.steps;

	}

	var steps = thisField.steps;
	var interval = thisField.interval;
	thisField.boundaries = [];
	var lower_bound = min;

	for (var x=0; x<steps; x++) {
		thisField.boundaries[x]= {'lower':lower_bound, 'upper':lower_bound + interval};
		lower_bound += interval;

	}
	return;


}





//////////////////////////////////////////////////////////////////////////////////////
function highlight_areas(e) {


	$('area').each (function(i) {
		var this_class = $(this).attr('class');
		this_class=this_class.replace("fillOpacity:1","fillOpacity:0.1");
		$(this).attr('class', this_class);
	});


	$('area.' + e).each (function(i) {
		var this_class = $(this).attr('class');
		this_class=this_class.replace("fillOpacity:0.1","fillOpacity:1");
		$(this).attr('class', this_class);
	});
	$('.map').maphilight();

}

//////////////////////////////////////////////////////////////////////////////////////
function unhighlight_areas(e) {
	$('area').each (function(i) {
		var this_class = $(this).attr('class');
		this_class=this_class.replace("fillOpacity:0.1","fillOpacity:1");
		$(this).attr('class', this_class);
	});
	$('.map').maphilight();

}


//////////////////////////////////////////////////////////////////////////////////////
function getMaxXY (selector) {
	var xArry = [];
	var yArry = [];
	$(selector).each (function (i) {
		// get the coordinate pairs for each polygon area and put them in an array
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');

		// split off the x's in one array, the y's in another
		for (x=0;x<coordArry.length;x+=2) {
			xArry.push(parseInt(coordArry[x]));
			yArry.push(parseInt(coordArry[x+1]));
		}

	}); // each

	// get max,min, average for the x's and y's
	// the average x,y will be the center of the square that bounds the polygon
	var xmax = Math.max.apply(Math, xArry);
	var ymax = Math.max.apply(Math, yArry);
	return new Point(xmax,ymax);

}

//////////////////////////////////////////////////////////////////////////////////////
function getMinXY (selector) {
	var xArry = [];
	var yArry = [];
	$(selector).each (function (i) {
		// get the coordinate pairs for each polygon area and put them in an array
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');

		// split off the x's in one array, the y's in another
		for (x=0;x<coordArry.length;x+=2) {
			xArry.push(parseInt(coordArry[x]));
			yArry.push(parseInt(coordArry[x+1]));
		}

	}); // each

	// get min for the x's and y's

	var xmin = Math.min.apply(Math, xArry);
	var ymin = Math.min.apply(Math, yArry);
	return new Point(xmin,ymin);

}

//////////////////////////////////////////////////////////////////////////////////////
function getFieldIndexByName (fieldname) {
	for (var x=0;x<map_init.fields.length;x++) {
		if (map_init.fields[x].name==fieldname) {
			return x;
		}
	}
	return 0;
}


//////////////////////////////////////////////////////////////////////////////////////
function labelMap (img_selector,field_index) {


	if (map_init.settings.label_map === false) {
		return;
	}

	if (field_index === undefined) {

		var field_index = 0;
		if (map_init.hasOwnProperty('initial_field')) {
			field_index = getFieldIndexByName(map_init.initial_field);
		}
	}

	var field = map_init.fields[field_index];

	var area_selector = $("img" + img_selector).attr("usemap") + " area";
 	var label_div_content = "";

	
	$(area_selector).each (function (i) {

		
		if ($(this).data('geo')) {
			var location =  $(this).data('geo');
		}
		else {

			//get the onMouseOver attribute
			var thisOnMouseOver = $(this).attr('onMouseOver') || "";
			var thisOnMouseOverStr = thisOnMouseOver.toString();
			var location = extractLoc(thisOnMouseOverStr) || "";
		}
		
		var this_value = locDataLookup(location.replaceSpacesLowerCase(),field_index);
		var label = location.restoreSpaces();


		// see if we want the map labels to show location or the value for this field
		if (typeof field !== "undefined") {
			if (field.hasOwnProperty('map_display')) {
				if (field.map_display === "values") {
					label = this_value;

				}
			}
		}
		// find the centroid coordinates for this polygon area - this is where the label goes
		// get the coordinate pairs for this polygon area and put them in an array
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');
		var perimeter = new Contour();

		for (var j=0;j<coordArry.length;j+=2) {
			var this_point = new Point(parseInt(coordArry[j]),parseInt(coordArry[j+1]));
			perimeter.pts.push(this_point);
		}
		var this_centroid_pt = perimeter.centroid();

		// test for NaN
		if (this_centroid_pt.x !== this_centroid_pt.x  || this_centroid_pt.y!==this_centroid_pt.y) {
			return;
		}

		// create a style based on the centroid x,y coordinates
		var this_style = 'left:' + this_centroid_pt.x + 'px; top:' + this_centroid_pt.y + 'px; ';
		var this_id = location + '_label';

		// create a div and put in the style with the coordinates
		label_div_content += '<div onMouseOver="mapOnMouseOver(\'' + location.restoreSpaces() + '\');" class="map_label"';
		label_div_content += ' style="' + this_style + '" ';
		label_div_content += ' id="' + this_id + '" ';
		label_div_content += '>' + label  + '</div>';

	});  // end of each
	$('#label_div').html(label_div_content);
}


//////////////////////////////////////////////////////////////////////////////////////
function getPaletteColor(field_index,palette_index) {


	// global map_init.fields
	if (map_init.fields[field_index].palette.length>palette_index && palette_index !== null) {
		return map_init.fields[field_index].palette[palette_index];
	}
	return map_init.settings.color_no_data;

}

//////////////////////////////////////////////////////////////////////////////////////
function colorMap(field_index) {

	if (field_index === undefined) {
		var field_index = getFieldIndexByName(map_init.initial_field);
	}

	var start = new Date().getTime();
	// global objects: map_init, map_init.fields

	

	$("area").each (function () {
			if ($(this).data('geo')) {
				var this_loc = $(this).data('geo');
			}
			else {
				var thisOnMouseOver = $(this).attr('onMouseOver') || "";
				var this_loc = extractLoc(thisOnMouseOver.toString());
			}

			var border_color = map_init.settings.polygon_border_color;

			if (map_init.hasOwnProperty("indexed_data")) {
				var this_data_obj = map_init.indexed_data[this_loc.replaceSpacesLowerCase()];
				var map_field_name = map_init.fields[field_index].name;
				var this_data = this_data_obj[map_field_name];
				var step = getLegendStep(this_data,field_index);
				var color=getPaletteColor(field_index,step);
				var new_class = "step_" + step + " {strokeColor:'" + border_color + "',strokeWidth:0.5,fillColor:'" + color + "',fillOpacity:1,alwaysOn:true,fade:false}";
				$(this).attr('class', new_class);
				$(this).attr('id', 'id_' + this_loc.replaceSpacesLowerCase() );
			}
			else {
				// No match for this place in the data; give it default color for no data
				var color = map_init.settings.color_no_data;
				var fill_opacity = map_init.settings.fill_opacity_no_data;
				var stroke_width = map_init.settings.stroke_width_no_data;
				var stroke_color = map_init.settings.stroke_color_no_data;
				var new_class = " {fillColor:'" + color + "',strokeColor:'" + stroke_color + "',strokeWidth:" + stroke_width + ",fillOpacity:" + fill_opacity + ",alwaysOn:true,fade:false}";
				$(this).attr('class', new_class);
			}

	});


var end = new Date().getTime();
var time = end - start;
time = (time>1000) ? time/1000 + ' sec' : time + ' millsec';
console.log('colorMap() execution time: ' + time);

}

//////////////////////////////////////////////////////////////////////////////////////
function getLabel(field_name) {

	// global map_init.fields
	var search_obj = {};
	search_obj['name'] = field_name;
	var this_field = _.findWhere(map_init.fields,search_obj);
	if (this_field !== undefined) {
		return this_field.label;
	}
	return field_name;
}

//////////////////////////////////////////////////////////////////////////////////////
function jsonToTable(json,this_class,this_id) {

	if (typeof(json) === "undefined") {
		return "";
	}

	var classStr = (this_class) ? ' class="' + this_class + '" ' : '';
	var idStr = (this_id) ? ' id="' + this_id + '" ' : '';
	var headers = new Array();
	var formats = new Array();
	var data;
	var html = '';
	var location_field_name = map_init.join_field;
	var headers = _.pluck(map_init.fields, "name");

	html = '<table' + classStr + idStr + '>';
	html += '<thead>';
	html += '<tr>';
	for (var col=0; col<headers.length; col++) {
		html += '<th>' + getLabel(headers[col]) + '</th>';
	}
	html += '</tr>';
	html += '<thead>';
	html += '<tbody>';

	for (var row = 0; row<json.length; row++) {
		html += '<tr>';
		for (var head = 0; head<headers.length; head++) {
			var raw = json[row][headers[head]];
			data = raw;
//			data = ($.isNumeric(raw) && (typeof map_init.fields !=='undefined')) ? raw.format(map_init.fields[head].format) : raw;
			html +='<td>' + data + '</td>';
		}
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	return html;
}
//////////////////////////////////////////////////////////////////////////////////////
function buildMapChooser(selector){
	// global - map_init
	if (map_init.settings.show_map_chooser === true) {
		var html = '<select onchange="changeMap(\'' + selector + '\',this.value);">';
		$.each(map_init.fields, function(index) {
			if (this.mapable === true) {
				html += '<option value="' + index + '">' + this.label + '</option>'
			}  // end if
		}); // end each
		html += "</select>";
		$("#map_chooser").html(html);
	} // end if
}

//////////////////////////////////////////////////////////////////////////////////////
function changeMap(selector,index) {

	colorMap(index);
	labelMap(selector,index)
	buildLegend(index);
	$('.map').maphilight();
}
//////////////////////////////////////////////////////////////////////////////////////
function areaToCoordArray(selector) {

	var pointArray = [];
	var x,y;

	var coordStr = $(selector).attr('coords');
	var coordArry = coordStr.split(',');

	for (j=0;x<coordArry.length;j+=2) {
		x = parseInt(coordArry[j]);
		y = parseInt(coordArry[j+1]);
		pointArray.push([x,y]);
	}
	return pointArray;

}
//////////////////////////////////////////////////////////////////////////////////////
function coordArrayToArea(selector,pointsArray) {
	var coordStr = pointsArray.join(",");
	$(selector).attr('coords',coordStr);
	return $(selector);
}

//////////////////////////////////////////////////////////////////////////////////////
function getXYBounds (selector) {
	var xArry = [];
	var yArry = [];
	$(selector).each (function (i) {
		// get the coordinate pairs for each polygon area and put them in an array
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');

		// split off the x's in one array, the y's in another
		for (x=0;x<coordArry.length;x+=2) {
			xArry.push(parseInt(coordArry[x]));
			yArry.push(parseInt(coordArry[x+1]));
		}

	}); // each

	// get min for the x's and y's

	var xmin = Math.min.apply(Math, xArry);
	var ymin = Math.min.apply(Math, yArry);
	var xmax = Math.max.apply(Math, xArry);
	var ymax = Math.max.apply(Math, yArry);

	var bounds = {};

	bounds.upperLeft = new Point(xmin,ymin);
	bounds.lowerLeft = new Point(xmin,ymax);
	bounds.upperRight = new Point(xmax,ymin);
	bounds.lowerRight = new Point(xmax,ymax);

	return bounds;

}

//////////////////////////////////////////////////////////////////////////////////////
function rotatePoint(x, y, xm, ym, a) {
    

    var cos = Math.cos,
        sin = Math.sin,

        a = a * Math.PI / 180, // Convert to radians because that's what
                               // JavaScript likes

        // Subtract midpoints, so that midpoint is translated to origin
        // and add it in the end again
        xr = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm,
        yr = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;

    return [xr, yr];
}

//rotate(16, 32, 16, 16, 30); // [8, 29.856...]


function rotateArea(img_selector,degrees) {
	
	var area_selector = $(img_selector).attr("usemap") + " area";
	var bounds = getXYBounds(area_selector);
	var xm = (bounds.lowerRight.x - bounds.upperLeft.x) / 2;
	var ym = (bounds.lowerRight.y - bounds.upperLeft.y) / 2;


	$(area_selector).each (function (i) {

		// get the coordinate pairs for this polygon area and put them in an array
		var coordStr = $(this).attr('coords');
		var coordArry = coordStr.split(',');

		for (var j=0;j<coordArry.length;j+=2) {
			var x = coordArry[j];
			var y = coordArry[j+1];

			var newPoint = rotatePoint(x, y, xm, ym, degrees);
			coordArry[j]=parseInt(newPoint[0]);
			coordArry[j+1]=parseInt(newPoint[1]);
		}

		coordStr = coordArry.join();
		$(this).attr('coords',coordStr);
	});


	
}


//////////////////////////////////////////////////////////////////////////////////////

function initialize(selector) {

	if (typeof map_init === "undefined") {
		map_init = {};
	}

	initApp();
	initFields();
	buildMapChooser(selector);
	mapResizeWidth();
	imageMapTrim(selector);
	resizeImage(selector);
	colorMap();
	buildLegend();
	labelMap(selector);
	$(selector).maphilight();


} // end initialize


//////////////////////////// events //////////////////////////////////////////
$(document).ready(function(){

			
			$("area").on("mouseover",function(){
				var loc = $(this).data("geo");
				mapOnMouseOver(loc);
			});


			// make tooltip go away when mouse is moved off of area
			$("area").mouseleave(function() {
				UnTip();
			});
			$(".map_label").mouseleave(function() {
				UnTip();
			});

});