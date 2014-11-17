var Map = require('es6-collections');

console.log(Map);

function test1(start, len) {
    var lines = {
        lineLength: len,
        lineno: start
    };

    var score_lines = new Map([
        [0, "cat"],
        [1, "dog"],
        [2, "mouse"],
        [3, "chicken"]
    ]);

    var count = score_lines.size;

    for (var i = 0; i < lines.lineLength; i++) {
        console.log(score_lines.get(i + lines.lineno)); //.remove();
        score_lines.delete(i + lines.lineno);
    }

    for (var j = lines.lineno; j < score_lines.size; j++) {
        score_lines.set(j, score_lines.get(j + lines.lineLength));
        score_lines.delete(j + lines.lineLength);
    }

    console.log("0", score_lines.get(0));
    console.log("1", score_lines.get(1));
    console.log("2", score_lines.get(2));
    console.log("3", score_lines.get(3));
}

function test2(start, len, data) {

	var lines = {
		lineLength: len,
		lineno: start
	};

	var score_lines = new Map([
		[ 0, "cat"],
		[ 1, "chicken"]
	]);

    for (var j = score_lines.size-1; j >= lines.lineno; j--) {
        var currentLine = score_lines.get(j);
        score_lines.set(j + lines.lineLength, currentLine);   
        score_lines.delete(j);     
    }

    console.log("0", score_lines.get(0));
    console.log("1", score_lines.get(1));
    console.log("2", score_lines.get(2));
    console.log("3", score_lines.get(3));
}