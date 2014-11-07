'use strict';

var drawing_functions = {},
    randomColor = require('randomcolor'),
    glyphs = require('./glyphs'),
    _ = require('vendor').lodash;

drawing_functions.note = function(line, currentNote, totalOffset, force_down_stem) {

    var notedot = null;

    var noteGroup = line.group();

    var color = '#000';

    if(currentNote.notelength < 4) {
        //notedot = noteGroup.ellipse(10, 8).attr({
        //    fill: color
        //});
        notedot = noteGroup.path(glyphs["noteheads.quarter"].d).attr({ fill: 'black'}).move(0,4);
    } else if (currentNote.notelength < 8){
        notedot = noteGroup.path(glyphs["noteheads.half"].d).attr({ fill: 'black'}).move(0,4);
    } else {
        notedot = noteGroup.path(glyphs["noteheads.whole"].d).attr({ fill: 'black'}).move(0,4);
    }

    if(currentNote.notelength < 8) {
        if (currentNote.pos > 5 || force_down_stem === 1) {
            noteGroup.line(0, 8, 0, 34).stroke({
                width: 1,
                color: color
            });
            if(currentNote.notelength == 1) noteGroup.path(glyphs["flags.u8th"].d).attr({ fill: 'black'}).scale(1.2, -0.9).move(0,-38);
        } else {
            noteGroup.line(0, 4.5, 0, -24).stroke({
                width: 1,
                color: color
            });
            notedot.move(-10, 0);
            if(currentNote.notelength == 1) noteGroup.path(glyphs["flags.u8th"].d).attr({ fill: 'black'}).move(0,-24).scale(1);
        }
    }

    noteGroup.move(totalOffset, 36 - (currentNote.pos * 4));
};

drawing_functions.barline = function(line, currentSymbol, totalOffset) {
    line.rect(1, 32).move(totalOffset, 0).attr({
        fill: 'black'
    });
};

drawing_functions.space = _.noop;

drawing_functions.beat_rest = function(line, currentSymbol, totalOffset) {
    line.path(glyphs["rests.quarter"].d).attr({ fill: 'black'}).move(totalOffset,6);
}

drawing_functions.treble_clef = function(line) {
    line.path(glyphs["clefs.G"].d).attr({ fill: 'black'}).move(8,-12);
}

module.exports = drawing_functions;