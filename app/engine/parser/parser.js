define([
    "engine/parser/constants",
    "engine/parser/abc",
    "engine/parser/numberParser",
    "engine/parser/letterParser",
    "vendor/lodash/dist/lodash"
], function(constants, parser) {

    var service = {};

    var cache = [];

    var headerRegex = /^[A-Za-z]:/;

    function processLine(lines, i, settings, output) {

        if (i === lines.length) return output;

        if (headerRegex.test(lines[i])) {
            output.push({
                type: "header",
                data: lines[i].substring(2).trim(),
                key: lines[i][0]
            });
            return processLine(lines, ++i, settings, output);
        }

        if (cache[i] != undefined && lines[i] === cache[i].raw) {
            output.push(cache[i].processed);
        } else {
            console.log("PARSING " + lines[i])
            var parsedLine = parser.parse(lines[i]);
            console.log("DONE:", parsedLine);
            output.push(parsedLine);
            cache[i] = {
                raw: lines[i],
                processed: parsedLine
            };
            if (output[output.length - 1].type === 1) {
                settings.push(output);
            }
        }
        return processLine(lines, ++i, settings, output);
    }

    service.process = function(newdata) {
        var constants = constants;
        if (newdata) {
            try {
                return processLine(newdata.split('\n'), 0, [], []);
            } catch (e) {
                return (e.line + 1) + ":" + e.position + " -> " + e.message;
            }

        }
        return "";
    }

    return service;
});