var g = require('./glyphs');

var out = {};

Object.keys(g).forEach(function(a){ 
	var newToken = {};
	newToken.w = g[a].w;
	newToken.h = g[a].h;
	var svg_path = "";

	for(var i=0; i<g[a].d.length; i++) {
		for(var j=0; j<g[a].d[i].length; j++) {
			svg_path += g[a].d[i][j];
			if(j > 0 && j<g[a].d[i].length-1) {
				svg_path += ",";
			}
		}		
	}

	newToken.d = svg_path;
	out[a] = newToken;
});

out = JSON.stringify(out);

console.log(out);

var fs = require('fs');
fs.writeFile("glyphs.json", out, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 