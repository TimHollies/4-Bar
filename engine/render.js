'use strict';

var
    _ = require('vendor').lodash,
    svg = require('vendor').svgjs,
    enums = require('./types'),
    stave_symbols = require("./rendering/stave_symbols"),
    add_data_fields = require("./rendering/data_fields").add,
    remove_data_fields = require("./rendering/data_fields").remove,
    glyphs = require('./rendering/glyphs'),
    dispatcher = require('./dispatcher'),
    data_tables = require('./data_tables');

var
    draw,
    lineHeight = 80,
    lineWidth = 800,
    selectedLine_start,
    selectedLine_end;

var
    score_lines = [],
    score_lines_group,
    currentKey = {
        note: "C",
        mode: "Major"
    },
    currentTimeSig = {
        top: 4,
        bottom: 4
    };

var selectionRects = [];

var handler = [];

var alignScoreLines = function() {
    for (var i = 0; i < score_lines.length; i++) {
        score_lines[i].move(0, i * lineHeight);
    }
}

var drawDrawableLine = function(line, a, lineNumber) {

    if (a.parsed.length === 0) return;

    line.weight = a.weight;
    line.symbols = [];

    line.select = function() {
        selectionRects.push(line.svg.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }));
    }

    line.realign = function() {
        var leadin = line.leadInGroup.bbox().x2;
        var pos_mod = (lineWidth - leadin) / (line.weight + 1);
        for (var i = 0, totalOffset = 1; i < line.symbols.length; i++) {
            line.symbols[i].svg.move(pos_mod * totalOffset, line.symbols[i].svg.y());

            if (_.isFunction(data_tables.symbol_width[line.symbols[i].type])) {
                totalOffset += data_tables.symbol_width[line.symbols[i].type](line.symbols[i]);
            } else {
                totalOffset += data_tables.symbol_width[line.symbols[i].type];
            }
        }
    }

    line.redrawLeadIn = function() {
        line.leadInGroup.remove();
        var leadInGroup = line.leadInGroup = line.svg.group();

        //draw clef
        stave_symbols.treble_clef(leadInGroup);

        //draw keysig
        stave_symbols.keysig(leadInGroup, currentKey);

        //if this is line 1 then draw time sig
        if (a.di === 0) {
            stave_symbols.timesig(leadInGroup, currentTimeSig.top, currentTimeSig.bottom);
        }

        line.realign();
    }

    //draw stave
    stave_symbols.stave(line.svg, lineWidth);

    //draw selected box if this line is selected
    if (lineNumber >= selectedLine_start && lineNumber <= selectedLine_end) {
        selectionRects.push(line.svg.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }))
    }

    //line sections
    var
        symbolsGroup = line.symbolsGroup = line.svg.group();

    var leadInGroup = line.leadInGroup = line.svg.group();

        //draw clef
        stave_symbols.treble_clef(leadInGroup);

        //draw keysig
        stave_symbols.keysig(leadInGroup, currentKey);

        //if this is line 1 then draw time sig
        if (a.di === 0) {
            stave_symbols.timesig(leadInGroup, currentTimeSig.top, currentTimeSig.bottom);
        }

    var leadin = leadInGroup.bbox().x2;
    symbolsGroup.move(leadin, 0);

    //draw symbols
    var
        pos_mod = (lineWidth - leadin) / (a.weight + 1),
        beam_list = [],
        beam_depth = 0;

    if (a.parsed[a.parsed.length - 1].type == "barline") {
        pos_mod = (lineWidth - leadin) / (a.weight);
    }

    for (var j = 0, totalOffset = 1; j < a.parsed.length; j++) {

        var currentSymbol = a.parsed[j];

        if (currentSymbol.beamDepth != undefined && currentSymbol.beamDepth < 0) {
            if (currentSymbol.beamDepth <= beam_depth) {
                beam_list.push(currentSymbol);
                beam_depth = currentSymbol.beamDepth;
            }
        } else {
            //draw beam
            if (beam_list.length > 1) stave_symbols.beam(symbolsGroup, beam_list);
            beam_list = [];
            beam_depth = 0;
        }

        if (!_(Object.keys(stave_symbols)).contains(currentSymbol.type)) {
            console.log("Wanted to draw a " + currentSymbol.type + " don't know how");
            continue;
        }

        currentSymbol.svg = stave_symbols[currentSymbol.type](symbolsGroup, currentSymbol, pos_mod * totalOffset);

        if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
            totalOffset += data_tables.symbol_width[currentSymbol.type](currentSymbol);
        } else {
            totalOffset += data_tables.symbol_width[currentSymbol.type];
        }

        line.symbols.push(currentSymbol);
    }

    if (beam_list.length > 0) {
        //draw beam
        if (beam_list.length > 1) stave_symbols.beam(symbolsGroup, beam_list);
        beam_list = [];
        beam_depth = 0;
    }

    return line;
};

function handleDataLine(line) {
    if (line.parsed[0].type === "title") {
        dispatcher.send("change_tune_title", line.parsed[0].data);
    }
    if (line.parsed[0].type === "rhythm") {
        dispatcher.send("change_rhythm", line.parsed[0].data);
    }
    if (line.parsed[0].type === "key") {
        dispatcher.send("change_key", line.parsed[0].data);
    }
    if (line.parsed[0].type === "timesig") {
        dispatcher.send("change_timesig", line.parsed[0].data);
    }
}

//exported functions
module.exports = {

    initialize: function(canvasSelector) {
        draw = svg('canvas').size("100%", "100%").viewbox(0, 0, 1000, 800);

        score_lines_group = draw.group();

        score_lines_group.move(100, 80);

        dispatcher.on({
            "selection-changed": function(a) {
                _(selectionRects).forEach(function(sr) {
                    sr.remove();
                });

                selectedLine_start = a.start;
                selectedLine_end = a.stop;

                _(score_lines).filter(function(line) {
                    return (line.id - 1) >= a.start && (line.id - 1) <= a.stop;
                }).each(function(line) {
                    line.select();
                });
            },
            "change_key": function(key) {
                currentKey = key;
                for(var i=0; i<score_lines.length; i++){
                    score_lines[i].redrawLeadIn();
                }
            },
            "change_timesig": function(timesig) {
                currentTimeSig = timesig;
                for(var i=0; i<score_lines.length; i++){
                    score_lines[i].redrawLeadIn();
                }
            }
        });
    },

    onNext: function(lines) {

        if (lines.action === "ADD") {

            //draw tune lines
            var renderedLines = _(lines.split).filter(function(line) {
                return !line.error && line.type_class === enums.line_types.drawable;
            }).map(function(lineData, i) {

                var line = {};

                line.svg = score_lines_group.group();
                drawDrawableLine(line, lineData, i + lines.lineno);

                line.svg.move(0, ( /*i + lines.lineno*/ lineData.di) * 80);
                line.di = lineData.di;
                line.id = i + lines.lineno;

                return line;
            }).value();


            //renderedLines[0].di IS UNDEFINED!!!!
            if (renderedLines.length > 0) {

                var args = [renderedLines[0].di, 0].concat(renderedLines);
                Array.prototype.splice.apply(score_lines, args);

                for (var i = renderedLines[0].di; i < score_lines.length; i++) {
                    score_lines[i].svg.move(0, i * 80);
                    score_lines[i].id += renderedLines.length;
                }
            }

            //draw or handle data lines
            _(lines.split).filter(function(line) {
                return !line.error && line.type_class === enums.line_types.data;
            }).each(handleDataLine);
        }

        if (lines.action === "DEL") {

            var dl = _(lines.split).filter(function(line) {
                return !line.error && line.type_class === enums.line_types.drawable;
            }).value();

            if (dl.length > 0) {
                var removed_lines = score_lines.splice(dl[0].di, dl.length);

                _.each(removed_lines, function(removed_line) {
                    removed_line.svg.remove();
                });

                for (var i = dl[0].di; i < score_lines.length; i++) {
                    score_lines[i].svg.move(0, i * 80);
                    score_lines[i].id -= dl.length;
                }
            }
        }

        console.log(score_lines);
        return lines;
    }

};