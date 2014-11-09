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
    scoreLines,
    lineHeight = 80,
    lineWidth = 1024,
    selectedLine;

var selectionRects = [];

var arrangeGroups = function() {
    var offset = 1,
        center_offset = (draw.node.clientWidth - lineWidth)/2;

    for (var i = 0; i < scoreLines.length; i++) {
        if (scoreLines[i] === undefined) continue;

        if (scoreLines[i] != 0) {
            scoreLines[i].move(center_offset, lineHeight * offset);
            offset += 1;
        }
    }
}
 
var handler = [];

handler[(enums.line_actions.add << 2) + enums.line_types.drawable] = function(a) {

    if (scoreLines[a.i] === undefined) {
        scoreLines[a.i] = draw.group();
    } else {
        scoreLines.splice(a.i, 0, draw.group());
    }

    var groupDraw = scoreLines[a.i];

    //draw stave
    stave_symbols.stave(groupDraw, lineWidth);

    //draw selected box if this line is selected
    if(a.i === selectedLine) {
        selectionRects.push(groupDraw.rect(4, 34).move(-8, 0).attr({ fill: '#223378' }))
    }

    groupDraw.select = function() {
        selectionRects.push(groupDraw.rect(4, 34).move(-8, 0).attr({ fill: '#223378' }));    
    }

    //draw clef
    stave_symbols.treble_clef(groupDraw);

    //if this is line 1 then draw time sig
    if(a.i === 0) {
        stave_symbols.timesig(groupDraw, 6, 8);
    }

    //draw symbols
    var 
        pos_mod = lineWidth/(a.weight+1),
        beam_list = [],
        beam_depth = 0;

    for (var j = 0, totalOffset = 1; j < a.parsed.length; j++) {

        var currentSymbol = a.parsed[j];

        if(currentSymbol.beamDepth != undefined && currentSymbol.beamDepth < 0) {
            if(currentSymbol.beamDepth <= beam_depth) {
                beam_list.push(currentSymbol);
                beam_depth = currentSymbol.beamDepth;
            } 
        } else {
            //draw beam
            if(beam_list.length > 1) stave_symbols.beam(groupDraw, beam_list);
            beam_list = [];
            beam_depth = 0;
        }

        if(!_(Object.keys(stave_symbols)).contains(currentSymbol.type)) {
            console.log("Wanted to draw a " + currentSymbol.type + " don't know how");
            continue;
        }

        currentSymbol.svg = stave_symbols[currentSymbol.type](groupDraw, currentSymbol, pos_mod * totalOffset);

        if(_.isFunction(data_tables.symbol_width[currentSymbol.type])) {
            totalOffset += data_tables.symbol_width[currentSymbol.type](currentSymbol);
        } else {
            totalOffset += data_tables.symbol_width[currentSymbol.type];
        }
    }

    if(beam_list.length > 0) {
        //draw beam
        if(beam_list.length > 1)stave_symbols.beam(groupDraw, beam_list);
        beam_list = [];
        beam_depth = 0;
    }
};

handler[(enums.line_actions.delete << 2) + enums.line_types.drawable] = function(a) {
    if (scoreLines[a.i]) scoreLines[a.i].remove();
    scoreLines[a.i] = undefined;
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

        scoreLines = [];

        dispatcher.subscribe(function(a) {
            if(a.type === "selection-changed") {
                _(selectionRects).forEach(function(sr) { sr.remove(); });
                selectedLine = a.start - 1;
                if(scoreLines[selectedLine]) {
                    scoreLines[selectedLine].select();
                }
            }
        });
    },

    onNext: function(a) {
        if(!a.error) {
            handler[(a.action << 2) + a.type_class](a);
            arrangeGroups();
            scoreLines = scoreLines.slice(0, a.newLength);            
        }
        return a;
    }

};