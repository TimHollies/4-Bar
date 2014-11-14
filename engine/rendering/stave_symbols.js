'use strict';

var drawing_functions = {},
    randomColor = require('randomcolor'),
    glyphs = require('./glyphs'),
    _ = require('vendor').lodash,
    SVG = require('vendor').svgjs,
    data_tables = require("../data_tables");

var 
    POS_SWITCH = 5,
    MAX_GRAD = 0.05;

/**
 * Draws a stave of width 'width'
 * @param  {SVG.Group} line  [line group to draw the stave in]
 * @param  {Number} width [width of line]
 * @return {Undefined}
 */
drawing_functions.stave = function(line, width) {
    for (var i = 0; i < 5; i++) {
        line.rect(width, 1).move(0, i * 8).attr({
            fill: 'black'
        });
    }

    // line.rect(1, 32).move(0, 0).attr({
    //     fill: 'black'
    // });

    // line.rect(1, 32).move(width, 0).attr({
    //     fill: 'black'
    // });
}


drawing_functions.note = function(line, currentNote, totalOffset, force_down_stem) {

    var notedot = null;

    var noteGroup = line.group();

    var color = '#000',
        stem_end = {
            x: 0,
            y: 0
        },
        stem_tail = null,
        stem = null;

    //invalid note length?
    if(data_tables.allowed_note_lengths.indexOf(currentNote.notelength) === -1) {
        console.log("INVALID NOTE LENGTH");
        for(var i=0; i<data_tables.allowed_note_lengths.length; i++) {
            if(currentNote.notelength > data_tables.allowed_note_lengths[i]) {
                currentNote.notelength = data_tables.allowed_note_lengths[i-1];
                break;
            }
        }
    }

    //dotted note?
    if((2*currentNote.notelength)%3 === 0) {
        noteGroup.circle(4,4).fill('black').move(3,6);
    }

    //double dotted note?
    if((4*currentNote.notelength)%7 === 0) {
        noteGroup.circle(4,4).fill('black').move(3,6);
        noteGroup.circle(4,4).fill('black').move(8,6);
    }

    //dot type
    if (currentNote.notelength < 4) {
        notedot = noteGroup.path(glyphs["noteheads.quarter"].d).attr({
            fill: 'black'
        }).move(0, 4);
    } else if (currentNote.notelength < 8) {
        notedot = noteGroup.path(glyphs["noteheads.half"].d).attr({
            fill: 'black'
        }).move(0, 4);
    } else {
        notedot = noteGroup.path(glyphs["noteheads.whole"].d).attr({
            fill: 'black'
        }).move(0, 4);
    }

    if (currentNote.notelength < 8) {
        if (currentNote.pos > POS_SWITCH || force_down_stem === 1) {

            //basic stem
            stem = noteGroup.line(0, 8, 0, 34).stroke({
                width: 1,
                color: color
            });

            //curly bit for quavers
            if (currentNote.notelength == 1) {
                stem_tail = noteGroup.path(glyphs["flags.u8th"].d).attr({
                    fill: 'black'
                }).scale(1.2, -0.9).move(0, -38);
            }

            //store point
            stem_end.y = 34;

        } else {

            //basic stem
            stem = noteGroup.line(0, 4.5, 0, -24).stroke({
                width: 1,
                color: color
            });

            notedot.move(-10, 4);

            //curly bit for quavers            
            if (currentNote.notelength == 1) {
                stem_tail = noteGroup.path(glyphs["flags.u8th"].d).attr({
                    fill: 'black'
                }).move(0, -24).scale(1);
            }

            //store point
            stem_end.y = -24;
        }
    }

    //accidentals

    switch (currentNote.accidental) {
        case "_":
            noteGroup.path(glyphs["accidentals.flat"].d).attr({
                fill: 'black'
            }).scale(1, 1).move(-20, -12);
            break;
        case "^":
            noteGroup.path(glyphs["accidentals.sharp"].d).attr({
                fill: 'black'
            }).scale(1, 1).move(-20, -12);
            break;
        case "=":
            noteGroup.path(glyphs["accidentals.nat"].d).attr({
                fill: 'black'
            }).scale(1, 1).move(-20, -12);
            break;
        case "__":
            noteGroup.path(glyphs["accidentals.dblflat"].d).attr({
                fill: 'black'
            }).scale(1, 1).move(-20, -12);
            break;
        case "^^":
            noteGroup.path(glyphs["accidentals.dblsharp"].d).attr({
                fill: 'black'
            }).scale(1, 1).move(-20, -12);
            break;
        default:
    }

    noteGroup.stem_end = stem_end;

    noteGroup.stem_tail = stem_tail;
    noteGroup.stem = stem;
    noteGroup.dot = notedot;

    noteGroup.move(totalOffset, 32 - (currentNote.pos * 4));

    return noteGroup;
};

drawing_functions.barline = function(line, currentSymbol, totalOffset) {
    var barline_group = line.group();

    switch (currentSymbol.subtype) {
        case "normal":
            barline_group.rect(1, 32).move(totalOffset, 0).attr({
                fill: 'black'
            });
            break;
        case "double":
            barline_group.rect(1, 32).move(totalOffset - 2, 0).attr({
                fill: 'black'
            });
            barline_group.rect(1, 32).move(totalOffset + 2, 0).attr({
                fill: 'black'
            });
            break;

        case "repeat_start":
            barline_group.circle(4).move(totalOffset + 12, 10).attr({
                fill: 'black'
            });

            barline_group.circle(4).move(totalOffset + 12, 19).attr({
                fill: 'black'
            });
        case "heavy_start":
            barline_group.rect(4, 32).move(totalOffset, 0).attr({
                fill: 'black'
            });

            barline_group.rect(1, 32).move(totalOffset + 8, 0).attr({
                fill: 'black'
            });
            break;

        case "repeat_end":
            barline_group.circle(4).move(totalOffset - 12, 10).attr({
                fill: 'black'
            });

            barline_group.circle(4).move(totalOffset - 12, 19).attr({
                fill: 'black'
            });
        case "heavy_end":
            barline_group.rect(4, 32).move(totalOffset, 0).attr({
                fill: 'black'
            });

            barline_group.rect(1, 32).move(totalOffset - 4, 0).attr({
                fill: 'black'
            });
            break;

        case "double_repeat":
            barline_group.rect(4, 32).move(totalOffset, 0).attr({
                fill: 'black'
            });

            barline_group.rect(1, 32).move(totalOffset + 5, 0).attr({
                fill: 'black'
            });
            barline_group.rect(1, 32).move(totalOffset - 4, 0).attr({
                fill: 'black'
            });
            barline_group.circle(4).move(totalOffset + 10, 10).attr({
                fill: 'black'
            });

            barline_group.circle(4).move(totalOffset + 10, 19).attr({
                fill: 'black'
            });
            barline_group.circle(4).move(totalOffset - 12, 10).attr({
                fill: 'black'
            });

            barline_group.circle(4).move(totalOffset - 12, 19).attr({
                fill: 'black'
            });
            break;

        default:
    }

    return barline_group;
};

drawing_functions.chord_annotation = function(line, currentSymbol, totalOffset) {
    return line.text(currentSymbol.text).font({
        family: 'Helvetica',
        size: 16,
        anchor: 'middle',
        leading: '1.5em'
    }).move(totalOffset, -30).attr({
        fill: 'black'
    });
};

drawing_functions.space = _.noop;

/**
 * [beat_rest description]
 * @param  {[type]} line          [description]
 * @param  {[type]} currentSymbol [description]
 * @param  {[type]} totalOffset   [description]
 * @return {[type]}               [description]
 */
drawing_functions.beat_rest = function(line, currentSymbol, totalOffset) {
    return line.path(glyphs["rests.quarter"].d).attr({
        fill: 'black'
    }).move(totalOffset, 6);
}

/**
 * [treble_clef description]
 * @param  {[type]} line [description]
 * @return {[type]}      [description]
 */
drawing_functions.treble_clef = function(line) {
    return line.path(glyphs["clefs.G"].d).attr({
        fill: 'black'
    }).move(8, -12);
}

/**
 * [timesig description]
 * @param  {[type]} line   [description]
 * @param  {[type]} top    [description]
 * @param  {[type]} bottom [description]
 * @return {[type]}        [description]
 */
drawing_functions.timesig = function(line, top, bottom) {
    var timeSig = line.group(),
        top_group = timeSig.group(),
        bottom_group = timeSig.group();
    //top

    top.toString().split('').forEach(function(num, i) {
        top_group.path(glyphs[num].d).attr({
            fill: 'black'
        }).move(38 + (i * 10), 1);
    });

    bottom.toString().split('').forEach(function(num, i) {
        bottom_group.path(glyphs[num].d).attr({
            fill: 'black'
        }).move(38 + (i * 10), 17);
    });

    var top_width = top_group.bbox().width,
        bottom_width = bottom_group.bbox().width;

    if (top_width > bottom_width) {
        bottom_group.move((top_width - bottom_width) / 2, 0);
    } else {
        top_group.move((bottom_width - top_width) / 2, 0);
    }

    return timeSig;
}

/**
 * [beam description]
 * @param  {[type]} line         [description]
 * @param  {[type]} beamed_notes [description]
 * @return {[type]}              [description]
 */
drawing_functions.beam = function(line, beamed_notes) {
    var average_pitch = _.reduce(beamed_notes, function(total, note) {
        return total + note.pos;
    }, 0);

    var upstem = (average_pitch < (beamed_notes.length * POS_SWITCH));

    var
        startX = beamed_notes[0].svg.x(),
        startY = beamed_notes[0].svg.y() - (upstem ? Math.abs(beamed_notes[beamed_notes.length - 1].svg.stem_end.y) : -Math.abs(beamed_notes[beamed_notes.length - 1].svg.stem_end.y)),//+ beamed_notes[0].svg.stem_end.y,
        endX = beamed_notes[beamed_notes.length - 1].svg.x(),
        endY = beamed_notes[beamed_notes.length - 1].svg.y() - (upstem ? Math.abs(beamed_notes[beamed_notes.length - 1].svg.stem_end.y) : -Math.abs(beamed_notes[beamed_notes.length - 1].svg.stem_end.y)),// + !upstem ? beamed_notes[beamed_notes.length - 1].svg.stem_end.y : -Math.abs(beamed_notes[beamed_notes.length - 1].svg.stem_end.y),
        grad = (startY - endY) / (endX - startX);

    //if(grad > MAX_GRAD) grad = MAX_GRAD;
    //if(grad < -MAX_GRAD) grad = -MAX_GRAD;

    //console.log(grad);

    line.polygon(new SVG.PointArray([
        [startX, startY],
        [startX, startY + 3],
        [endX, endY + 3],
        [endX, endY]
    ])).fill('black').stroke({
        width: 1
    });

    //console.log("UP", upstem);

    beamed_notes.forEach(function(note, i) {
        note.svg.stem_tail.remove();

        //if(i === 0 || i === beamed_notes.length - 1)return;
        note.svg.stem.remove();

        note.svg.stem = note.svg.line(0, 8, 0, -((note.svg.y() - startY) + ((note.svg.x() - startX) * grad))).stroke({
            width: 1,
            color: 'black'
        });
        if(upstem) {
            note.svg.dot.move(-10, 4);
        } else {
            note.svg.dot.move(0, 4);
        }        
    });
} 

module.exports = drawing_functions;