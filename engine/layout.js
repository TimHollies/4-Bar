var 
enums = require('./types'),
data_tables = require('./data_tables'),
_ = require('lodash'),
dispatcher = require('./dispatcher'),
AbcBeam = require('./types/AbcBeam'),
springs = require('./springs');

var ABCLayout = function (dispatcher) {

    var parsedLines = [];
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


    var currentRenderNoteId = 0;

    var layoutDrawableLine = function(line) {

        if(line.symbols.length === 0)return line;

        var
        posMod = 1 / (line.weight + 1),
        totalOffset = 0,
        beamList = [],
        beamDepth = 0,
        lastNote = null;

        var totalFixedWidth = 0,
            totalSpringConstant = 0;

        if(_.last(line.symbols).type === "barline") {
            posMod = 1 / (line.weight);
        }

        for (var i = 0; i < line.symbols.length; i++) {

            if(line.symbols[i].type === "tie" || line.symbols[i].type === "varient-section" || line.symbols[i].type == "slur") continue;

            var currentSymbol = line.symbols[i];

            //////////////////////////NEW//////////////////////////

            if(springs[currentSymbol.type] !== undefined) {
                if(currentSymbol.subType !== undefined) {
                    if(springs[currentSymbol.type][currentSymbol.subType] !== undefined) {
                        totalFixedWidth += (currentSymbol.fixedWidth = springs[currentSymbol.type][currentSymbol.subType]);
                    }
                } else {
                    totalFixedWidth += (currentSymbol.fixedWidth = springs[currentSymbol.type]);
                }                
            }

            if(!(i === line.symbols.length - 1 && line.symbols[i].type === "barline")) {
                if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
                    totalSpringConstant += (currentSymbol.springConstant = data_tables.symbol_width[currentSymbol.type](currentSymbol));
                } else {
                    totalSpringConstant += (currentSymbol.springConstant = data_tables.symbol_width[currentSymbol.type]);
                }
            }

            ///////////////////////////////////////////////////////

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

                line.symbols[i].renderNoteId = currentRenderNoteId++;

                currentSymbol.truepos = currentSymbol.pos + (7 * (currentSymbol.octave - 4));
                currentSymbol.y = 40 - (currentSymbol.truepos * 4);
                currentSymbol.beams = [];
            }

            if (currentSymbol.beamDepth !== undefined && currentSymbol.beamDepth < 0) {
               if(currentSymbol.type === "note")beamList.push(currentSymbol);
               beamDepth = currentSymbol.beamDepth;
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

        line.totalFixedWidth = totalFixedWidth;
        line.totalSpringConstant = totalSpringConstant;

        return line;
    }

    var handleDataLineSwitch = {
        title(data) {
            tuneSettings.title = data;
            dispatcher.fire("change_tune_title", data);
        },

        rhythm(data) {
            tuneSettings.rhythm = data;
            dispatcher.fire("change_rhythm", data);
        },

        key(data) {
            tuneSettings.key = data;
            dispatcher.fire("change_key", data);
        },

        timesig(data) {
            tuneSettings.measure = data;
            dispatcher.fire("change_timesig", data);
        },

        notelength(data) {
            tuneSettings.noteLength = data;
            dispatcher.fire("change_notelength", data);
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
        return line;    
    }

    var handleAction = {
        ADD ( lineCollection ) {


            var layoutedLines = lineCollection.lines.map(function(line) {
                if(line.type === "drawable") return layoutDrawableLine(line);
                if(line.type === "data") return handleDataLine(line);
                return line;
            });

            if (layoutedLines.length > 0) {
                var args = [layoutedLines[0].id, 0].concat(layoutedLines);
                Array.prototype.splice.apply(parsedLines, args);
            }

        },

        
        DEL ( lineCollection ) {

            if (lineCollection.lines.length > 0) {
                var removed_lines = parsedLines.splice(lineCollection.lines[0].id, lineCollection.lines.length);

                for (var i = lineCollection.lines[0].id; i < parsedLines.length; i++) {
                    parsedLines[i].id -= lineCollection.lines.length;
                }
            }
        }
    };

    return function(oldScoreLines, lineCollection) {

        handleAction[lineCollection.action](lineCollection);

        var changedLines = [];

        for(var i=lineCollection.startId; i<lineCollection.startId + lineCollection.count; i++) {
            changedLines.push(i);
        }

        if(oldScoreLines !== 0) {
            changedLines = changedLines.concat(oldScoreLines.changedLines);
        }

        return  {
            tuneSettings: tuneSettings,
            parsedLines: parsedLines,
            changedLines
        };

    }
}

module.exports = ABCLayout;