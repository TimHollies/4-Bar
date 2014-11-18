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
    score_lines_group;

var selectionRects = [];

var handler = [];

var drawDrawableLine = function(groupDraw, a, lineNumber) {

    if (a.parsed.length === 0) return;

    var leadin = 0;

    //draw stave
    stave_symbols.stave(groupDraw, lineWidth);

    //draw selected box if this line is selected
    if (lineNumber >= selectedLine_start && lineNumber <= selectedLine_end) {
        selectionRects.push(groupDraw.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }))
    }

    groupDraw.select = function() {
        selectionRects.push(groupDraw.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }));
    }

    //draw clef
    stave_symbols.treble_clef(groupDraw);
    leadin += 30;

    //if this is line 1 then draw time sig
    if (a.i === 0) {
        stave_symbols.timesig(groupDraw, 6, 8);
        leadin += 30;
    }

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
            if (beam_list.length > 1) stave_symbols.beam(groupDraw, beam_list);
            beam_list = [];
            beam_depth = 0;
        }

        if (!_(Object.keys(stave_symbols)).contains(currentSymbol.type)) {
            console.log("Wanted to draw a " + currentSymbol.type + " don't know how");
            continue;
        }

        currentSymbol.svg = stave_symbols[currentSymbol.type](groupDraw, currentSymbol, (pos_mod * totalOffset) + leadin);

        if (_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
            totalOffset += data_tables.symbol_width[currentSymbol.type](currentSymbol);
        } else {
            totalOffset += data_tables.symbol_width[currentSymbol.type];
        }
    }

    if (beam_list.length > 0) {
        //draw beam
        if (beam_list.length > 1) stave_symbols.beam(groupDraw, beam_list);
        beam_list = [];
        beam_depth = 0;
    }

    return groupDraw;
};

handler[(enums.line_actions.add << 2) + enums.line_types.data] = function(a) {

    scoreLines[a.i] = 0;

    if (add_data_fields[a.parsed[0].type] === undefined) {
        console.log("NOT YET IMPLEMENTED");
        return;
    }

    add_data_fields[a.parsed[0].type](a, draw);
};

handler[(enums.line_actions.delete << 2) + enums.line_types.data] = function(a) {

    scoreLines[a.i] = undefined;
    if (remove_data_fields[a.parsed[0].type] === undefined) {
        console.log("NOT YET IMPLEMENTED");
        return;
    }

    remove_data_fields[a.parsed[0].type](a);
};

handler[(enums.line_actions.add << 2) + enums.line_types.hidden] = function(a) {
    scoreLines[a.i] = 0;
};

handler[(enums.line_actions.delete << 2) + enums.line_types.hidden] = function(a) {
    scoreLines[a.i] = undefined;
}

handler[(enums.line_actions.move << 2) + enums.line_types.drawable] =
    handler[(enums.line_actions.move << 2) + enums.line_types.data] =
    handler[(enums.line_actions.move << 2) + enums.line_types.hidden] = function(a) {
        if (a.i < a.j) {
            scoreLines[a.i] = scoreLines[a.j];
            scoreLines[a.j] = undefined;
        }
        console.log("MOV", scoreLines);
}

//exported functions
module.exports = {

    initialize: function(canvasSelector) {
        draw = svg('canvas');

        score_lines_group = draw.group();

        score_lines_group.move(100, 80);

        dispatcher.on("selection-changed", function(a) {
            _(selectionRects).forEach(function(sr) {
                sr.remove();
            });

            selectedLine_start = a.start;
            selectedLine_end = a.stop;

            for (var i = selectedLine_start; i <= selectedLine_end; i++) {
                if (score_lines[i]) {
                    score_lines[i].select();
                }
            }
        });
    },

    onNext: function(lines) {

        if (lines.action === "ADD") {

            var renderedLines = _(lines.split).filter(function(line) {
                return !line.error && line.type_class === enums.line_types.drawable;
            }).map(function(line, i) {
                var svgline = score_lines_group.group();
                drawDrawableLine(svgline, line, i + lines.lineno);

                svgline.move(0, (i + lines.lineno) * 80);

                return svgline;
            }).value();

            var args = [lines.lineno, 0].concat(renderedLines);
            Array.prototype.splice.apply(score_lines, args);

            for (var i = lines.lineno + lines.lineLength; i < score_lines.length; i++) {
                score_lines[i].move(0, i * 80);
            }

        }

        if (lines.action === "DEL") {

            var removed_lines = score_lines.splice(lines.lineno, lines.lineLength);

            _.each(removed_lines, function(removed_line) {
                removed_line.remove();
            });

            for (var i = lines.lineno; i < score_lines.length; i++) {
                score_lines[i].move(0, i * 80);
            }

        }

        return lines;
    }

};