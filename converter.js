var fs = require('fs');
var cheerio = require('cheerio');

if (process.argv.length == 4) {
	var inFile = __dirname + "/" + process.argv[2];

	var outFile = __dirname + "/" + process.argv[3];

	var data = "";

	data = fs.readFile(inFile, 'utf8', function (err, data) {
	  if (err) {
	    console.log('Error Opening Input File: ' + err);
	    return;
	  }
		//console.log(data);

		doJSON(data);
	});
} else {
	console.log("usage: node coverter.js inputFile outpuFile");
}

//console.log("hi");

function doJSON(newInput) {
    // get input JSON, try to parse it

    input = newInput;
    if (!input) {
      // wipe the rendered version too
      $(".json code").html("");
      return;
    }

    console.log("ordered to parse JSON...");

    var json = jsonFrom(input);

    // if succeeded, prettify and highlight it
    // highlight shows when textarea loses focus
/*
    if (json) {
      var pretty = JSON.stringify(json, undefined, 2);
      $(".json code").html(pretty);
      hljs.highlightBlock($(".json code").get(0));
    } else
      $(".json code").html("");
*/
    // convert to CSV, make available
    doCSV(json);

    return true;
  }

function jsonFrom(input) {
  var string = input; //jquery.trim(input);
  if (!string) return;
  return JSON.parse(string);
}

 function doCSV(json) {
    // 1) find the primary array to iterate over
    // 2) for each item in that array, recursively flatten it into a tabular object
    // 3) turn that tabular object into a CSV row using jquery-csv
    var inArray = arrayFrom(json);


    var outArray = [];
    for (var row in inArray)
        outArray[outArray.length] = parse_object(inArray[row]);

    var csvHeader = PrintHeader(parse_object(inArray[row]));

//	console.log(outArray);
    var csvBody = ConvertToCSV(outArray); //$.csv.fromObjects(outArray);

// This is our final csv!!
// console.log(csv);

	fs.writeFileSync(outFile, csvHeader + csvBody);
  }


// otherwise, just find the first one
function arrayFrom(json, key) {
    //if ($.type(json) == "array")
    if (json instanceof Array)
        return json;
    else if (key)
        return json[key];

    else {
        for (var key in json) {
            //if ($.type(json[key]) == "array")
	    if (json[key] instanceof Array)
                return json[key];
        }

        // none found, consider the whole object a row
        return [json];
    }
}

function parse_object(obj, path) {
    if (path == undefined)
        path = "";

    var type = typeof(obj); // $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {

            var newD = parse_object(obj[i], path + i + "/");
            //$.extend(d, newD);
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

    // ?
    else return {};
}

function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}


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

function PrintHeader(objArray) {

           var str = '';

		for (obj in objArray) {
			str += obj + "," 
		}

 
str = str.substring(0, str.length - 1);
       str += '\r\n';


            return str;
}
