var 
    enums = require('./types'),
    data_tables = require('./data_tables'),
    _ = require('vendor').lodash,
    dispatcher = require('./dispatcher'),
    AbcBeam = require('./types/AbcBeam'),

    Layout = {},

    scoreLines = [],
    tuneSettings = {};

Layout.init = function() {
    //reset ALL the things
    scoreLines = [];
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

    if(_.last(line.symbols).type === "barline") {
        posMod = 1 / (line.weight);
    }

    for (var i = 0; i < line.symbols.length; i++) {

        if(line.symbols[i].type === "tie" || line.symbols[i].type === "varient-section" || line.symbols[i].type == "slur") continue;

        var currentSymbol = line.symbols[i];

        currentSymbol.xp = totalOffset;
        if(i === line.symbols.length - 1 && currentSymbol.type === "barline") {
            currentSymbol.xp = 1;
            currentSymbol.align = 2;
        }     

        if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
            totalOffset += (data_tables.symbol_width[currentSymbol.type](currentSymbol)) * posMod;
        } else {
            totalOffset += (data_tables.symbol_width[currentSymbol.type] * posMod);
        }

        if (currentSymbol.type === "note") {
            currentSymbol.truepos = currentSymbol.pos + (7 * (currentSymbol.octave - 4));
            currentSymbol.y = 40 - (currentSymbol.truepos * 4);
            currentSymbol.beams = [];

            lastNote = currentSymbol;
        }

        if (currentSymbol.beamDepth && currentSymbol.beamDepth < 0) {
            if (currentSymbol.beamDepth <= beamDepth) {
                if(currentSymbol.type === "note")beamList.push(currentSymbol);
                beamDepth = currentSymbol.beamDepth;
            }
        } else {
            //draw beam
            if(currentSymbol.type === "note")beamList.push(currentSymbol);
            if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
            beamList = [];
            beamDepth = 0;
        }
    }

    if (beamList.length > 0) {
        //draw beam
        if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
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
        tuneSettings.measure = line.symbols[0].data;
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
            return !line.error && line.type === "drawable";
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