var JsDiff = require('diff');
var fs = require('fs');
var _ = require('lodash');

fs.readFile("Tam Lin.abc", "utf8", function(error, data) {
    fs.readFile("Tam Lin 2.abc", "utf8", function(error, data2) {
        var diff = JsDiff.diffLines(data, data2);

        for (var i=0; i < diff.length; i++) {

            if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
                var swap = diff[i];
                diff[i] = diff[i + 1];
                diff[i + 1] = swap;
            }
        }

        var line_count = 0;
        var output = [];

        for (var i=0; i < diff.length; i++) {
            var item = diff[i],
                newlines = 0;

            newlines = item.value.split('\n').length - 1;

            item.lineno = line_count;

            if (!item.removed) {
                line_count += newlines;
            }  
            output.push({
                lineno: item.lineno,
                raw: item.value,
                action: item.added ? "ADD" : item.removed ? "DEL" : "NONE",
                lineLength: newlines
            });
        }

        console.log(output);       
    });
});