var Layout = {};

var
    scoreLines = [],
    tuneSettings = {},
    enums = require('./types'),
    data_tables = require('./data_tables'),
    _ = require('vendor').lodash,
    dispatcher = require('./dispatcher');

Layout.init = function() {
    tuneSettings = {
        key: {
            note: "C",
            mode: "Major"
        },
        measure: {
            top: 4,
            bottom: 4
        },
        title: "Untitled Tune"
    };
}

var layoutDrawableLine = function(line) {

    var
        posMod = 1 / (line.weight + 1),
        totalOffset = 0,
        beamList = [],
        beamDepth = 0,
        lastNote = null;

    for (var i = 0; i < line.symbols.length; i++) {

        var currentSymbol = line.symbols[i];

        currentSymbol.xp = totalOffset;        

        if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
            totalOffset += (data_tables.symbol_width[currentSymbol.type](currentSymbol)) * posMod;
        } else {
            totalOffset += (data_tables.symbol_width[currentSymbol.type] * posMod);
        }

        if (currentSymbol.type === "note") {
            currentSymbol.truepos = currentSymbol.pos + (7 * (currentSymbol.octave - 4));
            currentSymbol.beams = [];

            lastNote = currentSymbol;
        }

        if (currentSymbol.beamDepth && currentSymbol.beamDepth < 0) {
            if (currentSymbol.beamDepth <= beamDepth) {
                beamList.push(currentSymbol);
                beamDepth = currentSymbol.beamDepth;
            }
        } else {
            //draw beam
            beamList.push(currentSymbol);
            if (beamList.length > 1) lastNote.beams.push(beamList);
            beamList = [];
            beamDepth = 0;
        }
    }

    if (beamList.length > 0) {
        //draw beam
        if (beamList.length > 1) lastNote.beams.push(beamList);
        beam_list = [];
        beam_depth = 0;
    }

    return line;
}

function handleDataLine(line) {
    if (line.symbols[0].type === "title") {
        tuneSettings.title = line.symbols[0].data;
        dispatcher.send("change_tune_title", line.symbols[0].data);
    }
    if (line.symbols[0].type === "rhythm") {
        dispatcher.send("change_rhythm", line.symbols[0].data);
    }
    if (line.symbols[0].type === "key") {
        tuneSettings.key = line.symbols[0].data;
        dispatcher.send("change_key", line.symbols[0].data);
    }
    if (line.symbols[0].type === "timesig") {
        dispatcher.send("change_timesig", line.symbols[0].data);
    }
}

var handleAction = {
    "ADD": function(lineCollection) {
        //draw tune lines
        var renderedLines = lineCollection.lines.filter(function(line) {
            return !line.error && line.type === "drawable";
        }).map(layoutDrawableLine);


        //renderedLines[0].di IS UNDEFINED!!!!
        if (renderedLines.length > 0) {
            var args = [renderedLines[0].di, 0].concat(renderedLines);
            Array.prototype.splice.apply(scoreLines, args);
        }

        //draw or handle data lines
        lineCollection.lines.filter(function(line) {
            return !line.error && line.type === "data";
        }).forEach(handleDataLine);

    },
    "DEL": function(lineCollection) {
        var dl = lineCollection.lines.filter(function(line) {
            return !line.error && line.type_class === enums.line_types.drawable;
        });

        if (dl.length > 0) {
            var removed_lines = scoreLines.splice(dl[0].di, dl.length);

            for (var i = dl[0].di; i < scoreLines.length; i++) {
                scoreLines[i].id -= dl.length;
            }
        }
    }
};

Layout.onNext = function(oldScoreLines, lineCollection) {
    lineCollection.action === "NONE" || handleAction[lineCollection.action](lineCollection);
    console.log("LAYOUT", scoreLines);
    return  {
        scoreLines: scoreLines,
        tuneSettings: tuneSettings
    };
}

module.exports = Layout;