var fs = require('fs');
var cheerio = require('cheerio');

if (process.argv.length == 4) {
	var inFile = __dirname + "/" + process.argv[2];
	var outFile = __dirname + "/" + process.argv[3];
	
	fs.readFile(inFile, 'utf8', function (err, data) {
		if (err) {
			console.log('Error Opening Input File: ' + err);
			return;
		}
		doJSON(data);
	});
} else {
	console.log("usage: node coverter.js inputFile outpuFile");
}

/* doJSON
 * 
 * Take input string, turn into json string, attempt CSV parsing
 */
function doJSON(input) {
	
	// get input JSON, try to parse it
	if (!input) {
		return false;
	}
	var json = jsonFrom(input);

	/* CSV Creation part */
	
	// 1) find the primary array to iterate over
	// 2) for each item in that array, recursively flatten it into a tabular object
	// 3) turn that tabular object into a CSV row
	var inArray = arrayFrom(json);

	var outArray = [];
	for (var row in inArray) {
		outArray[outArray.length] = parse_object(inArray[row]);
	}

	// Get our column names
	var csvHeader = PrintHeader(parse_object(inArray[row]));

	// Get our actual data
	var csvBody = ConvertToCSV(outArray);
	
	fs.writeFileSync(outFile, csvHeader + csvBody);
	
	return true;
}

/* jsonFrom
 * 
 * Turns string into JSON object thing.
 */
function jsonFrom(input) {
	var string = input;
	if (!string) return;
	return JSON.parse(string);
}

/* arrayFrom
 * 
 * Takes a JSON string and returns in array form.
 */
function arrayFrom(json, key) {
	if (json instanceof Array) {
		return json;
	}
	else if (key) {
		return json[key];
	}
	else {
		for (var key in json) {
			if (json[key] instanceof Array) {
				return json[key];
			}
		}

		// none found, consider the whole object a row
		return [json];
	}
}

/* parse_object
 *
 * What does this do...either turning JSON into objects or flattening JSON?
 */
function parse_object(obj, path) {
	if (path == undefined) {
		path = "";
	}

	var type = typeof(obj);
	var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

	if (type == "array" || type == "object") {
		var d = {};
		for (var i in obj) {
			var newD = parse_object(obj[i], path + i + "/");
			d = extend(d, newD);
		}
		return d;
	}
	else if (scalar) {
		var d = {};
		var endPath = path.substr(0, path.length-1);
		d[endPath] = obj;

		return d;
	}

	else return {};
}

/* extend
 *
 * A simple replace for jQuery's extend function.
 * Shamelessly stolen from http://stackoverflow.com/a/11197343
 */
function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}


/* ConvertToCSV
 *
 * Takes an array of JSON objects and
 * prints out their innards CSV style.
 */
function ConvertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}

/* PrintHeader
 * 
 * Takes a JSON object and prints the attribute names as CSV field names 
 */
function PrintHeader(objArray) {
	var str = '';

	for (obj in objArray) {
		str += obj + "," 
	}

	str = str.substring(0, str.length - 1);
	str += '\r\n';

	return str;
}
