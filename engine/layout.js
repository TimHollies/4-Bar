var 
    enums = require('./types'),
    data_tables = require('./data_tables'),
    _ = require('lodash'),
    dispatcher = require('./dispatcher'),
    AbcBeam = require('./types/AbcBeam');

var ABCLayout = function () {

    var scoreLines = [];
    var tuneSettings = {
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

    var layoutDrawableLine = function(line) {

        if(line.symbols.length === 0)return line;

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
            }

            if (currentSymbol.beamDepth !== undefined && currentSymbol.beamDepth < 0) {
                if (currentSymbol.beamDepth <= beamDepth) {
                    if(currentSymbol.type === "note")beamList.push(currentSymbol);
                    beamDepth = currentSymbol.beamDepth;
                }
            } else {
                //draw beam
                //if(currentSymbol.type === "note")beamList.push(currentSymbol);
                if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
                beamList = [];
                beamDepth = 0;
            }

            if(currentSymbol.type === "note") lastNote = currentSymbol;
        }

        if (beamList.length > 0) {
            //draw beam
            if (beamList.length > 1) lastNote.beams.push(new AbcBeam(beamList));
            beamList = [];
            beamDepth = 0;
        }

        return line;
    }

    var handleDataLineSwitch = {
        title(data) {
            tuneSettings.title = data;
            dispatcher.send("change_tune_title", data);
        },

        rhythm(data) {
            tuneSettings.rhythm = data;
            dispatcher.send("change_rhythm", data);
        },

        key(data) {
            tuneSettings.key = data;
            dispatcher.send("change_key", data);
        },

        timesig(data) {
            tuneSettings.measure = data;
            dispatcher.send("change_timesig", data);
        },

        notelength(data) {
            tuneSettings.noteLength = data;
            dispatcher.send("change_notelength", data);
        },

        number(data) {
            tuneSettings.number = data;
        },

        transcriber(data) {
            tuneSettings.transcriber = data;
        },

        source(data) {
            tuneSettings.source = data;
        },
    };

    function handleDataLine(line) {
        handleDataLineSwitch[line.symbols[0].type](line.symbols[0].data);       
    }

    var handleAction = {
        ADD ( lineCollection ) {
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
        
        DEL ( lineCollection ) {
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

    return function(oldScoreLines, lineCollection) {
        lineCollection.action === "NONE" || handleAction[lineCollection.action](lineCollection);
        //console.log("LAYOUT", scoreLines);
        return  {
            scoreLines: scoreLines,
            tuneSettings: tuneSettings
        };
    }
}

module.exports = ABCLayout;