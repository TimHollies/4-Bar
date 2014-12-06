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

var drawDrawableLine = function(line) {

    if (line.weight === 0) return;

    line.select = function() {
        selectionRects.push(line.svg.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }));
    }

    line.realign = function() {
        var leadin = line.leadInGroup.bbox().x2;
        var noteAreaWidth = lineWidth - leadin;
        for (var j = 0; j < a.parsed.length; j++) {
            a.parsed[j].svg.x(currentSymbol.getX(leadin, lineWidth));
        }
    }

    line.drawLeadIn = function() {
        var leadInGroup = this.leadInGroup = this.svg.group();

        //draw clef
        stave_symbols.treble_clef(leadInGroup);

        //draw keysig
        stave_symbols.keysig(leadInGroup, currentKey);

        //if this is line 1 then draw time sig
        if (this.di === 0) {
            stave_symbols.timesig(leadInGroup, currentTimeSig.top, currentTimeSig.bottom);
        }
    }

    line.redrawLeadIn = function() {
        this.leadInGroup.remove();
        
        this.drawLeadIn();

        line.realign();
    }

    //draw stave
    stave_symbols.stave(line.svg, lineWidth);

    //draw selected box if this line is selected
    if (line.id >= selectedLine_start && line.id <= selectedLine_end) {
        selectionRects.push(line.svg.rect(4, 34).move(-8, 0).attr({
            fill: '#223378'
        }))
    }

    line.drawLeadIn();

    var 
        leadin = line.leadInGroup.bbox().x2,   
        noteAreaWidth = lineWidth - leadin,
        symbolsGroup = line.symbolsGroup = line.svg.group();

    for (var i = 0; i < line.parsed.length; i++) {

        var currentSymbol = line.parsed[i];

        if (!_(Object.keys(stave_symbols)).contains(currentSymbol.type)) {
            console.log("Wanted to draw a " + currentSymbol.type + " don't know how");
            continue;
        }

        currentSymbol.svg = stave_symbols[currentSymbol.type](symbolsGroup, currentSymbol, currentSymbol.getX(leadin, lineWidth));

        if(currentSymbol.beams && currentSymbol.beams.length > 0) {
            stave_symbols.beam(symbolsGroup, currentSymbol.beams[0]);
        }
    }

    symbolsGroup.move(leadin, 0);

    return line;
};

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
                for (var i = 0; i < score_lines.length; i++) {
                    score_lines[i].redrawLeadIn();
                }
            },
            "change_timesig": function(timesig) {
                currentTimeSig = timesig;
                for (var i = 0; i < score_lines.length; i++) {
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
            }).map(function(line) {
                line.svg = score_lines_group.group();
                return line;
            }).map(drawDrawableLine).value();
        }

        /*if (lines.action === "DEL") {

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
        }*/
        return lines;
    }

};