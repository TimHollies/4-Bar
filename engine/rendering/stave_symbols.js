'use strict';

var drawing_functions = {},
    randomColor = require('randomcolor'),
    glyphs = require('./glyphs'),
    _ = require('vendor').lodash,
    SVG = require('vendor').svgjs,
    data_tables = require("../data_tables");

var
    POS_SWITCH = 6,
    MAX_GRAD = 0.05,
    STEM_LENGTH = 28;

/**
 * Draws a stave of width 'width'
 * @param  {SVG.Group} line  [line group to draw the stave in]
 * @param  {Number} width [width of line]
 * @return {Undefined}
 */
drawing_functions.stave = function() {
    line.path(new SVG.PathArray([
        ['M', 0, 0],
        ['L', 800, 0],
        ['M', 0, 8],
        ['L', 800, 8],
        ['M', 0, 16],
        ['L', 800, 16],
        ['M', 0, 24],
        ['L', 800, 24],
        ['M', 0, 32],
        ['L', 800, 32],
        ['z']
    ])).stroke({
        color: 'black'
    });

    // line.rect(1, 32).move(0, 0).attr({
    //     fill: 'black'
    // });

    // line.rect(1, 32).move(width, 0).attr({
    //     fill: 'black'
    // });
}


function ledgerLineCount(a) {
    return ((a / 2) >> 0) + 1;
}

drawing_functions.note = function(line, currentNote, totalOffset) {

    var noteGroup = line.group();

    var noteDot = noteGroup.group();

    var color = '#000',
        stem_end = {
            x: 0,
            y: 0
        },
        stem_tail = null,
        stem = null;

    var truepos = currentNote.pos + (7 * (currentNote.octave - 4));

    //invalid note length?
    if (data_tables.allowed_note_lengths.indexOf(currentNote.notelength) === -1) {
        console.log("INVALID NOTE LENGTH");
        for (var i = 0; i < data_tables.allowed_note_lengths.length; i++) {
            if (currentNote.notelength > data_tables.allowed_note_lengths[i]) {
                currentNote.notelength = data_tables.allowed_note_lengths[i - 1];
                break;
            }
        }
    }

    //ledger line
    if (truepos < 1) {
        for (var i = 0, tar = ledgerLineCount(truepos); i < tar; i++) {
            line.line(totalOffset - 13, 32 + 8 * (i + 1), totalOffset + 3, 32 + 8 * (i + 1)).stroke({
                width: 1
            });
        }
    }

    if (truepos > 10) {

    }

    //dotted note?
    if ((2 * currentNote.notelength) % 3 === 0) {
        noteDot.circle(4, 4).fill('black').move(3, 6);
    }

    //double dotted note?
    if ((4 * currentNote.notelength) % 7 === 0) {
        noteDot.circle(4, 4).fill('black').move(3, 6);
        noteDot.circle(4, 4).fill('black').move(8, 6);
    }

    //dot type
    if (currentNote.notelength < 4) {
        noteDot.path(glyphs["noteheads.quarter"].d).attr({
            fill: 'black'
        }).move(0, 4);
    } else if (currentNote.notelength < 8) {
        noteDot.path(glyphs["noteheads.half"].d).attr({
            fill: 'black'
        }).move(0, 4);
    } else {
        noteDot.path(glyphs["noteheads.whole"].d).attr({
            fill: 'black'
        }).move(0, 4);
    }

    if (currentNote.notelength < 8) {
        if (truepos >= POS_SWITCH) {

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

            noteDot.move(-10, 4);

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

    currentNote.stem_end = stem_end;

    noteGroup.stem_tail = stem_tail;
    noteGroup.stem = stem;
    noteGroup.dot = noteDot;
    currentNote.truepos = truepos;


    currentNote.x = totalOffset;
    currentNote.y = 28 - (truepos * 4);

    noteGroup.move(currentNote.x, currentNote.y);


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

    var xoffset = line.bbox().x2 + 6;

    var timeSig = line.group(),
        top_group = timeSig.group(),
        bottom_group = timeSig.group();
    //top

    top.toString().split('').forEach(function(num, i) {
        top_group.path(glyphs[num].d).attr({
            fill: 'black'
        }).move(xoffset + (i * 10), 1);
    });

    bottom.toString().split('').forEach(function(num, i) {
        bottom_group.path(glyphs[num].d).attr({
            fill: 'black'
        }).move(xoffset + (i * 10), 17);
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

function sigmoid(a) {
    return (1 / (Math.exp(0.05 * (14 - a)) + 1) * 96) - 32;
}

/**
 * [beam description]
 * @param  {[type]} line         [description]
 * @param  {[type]} beamed_notes [description]
 * @return {[type]}              [description]
 */
drawing_functions.beam = function(line, beamed_notes) {

    var highestnote = null,
        smallestnote = null;

    var average_pitch = _.reduce(beamed_notes, function(total, note) {
        if (highestnote === null || note.truepos > highestnote.truepos) highestnote = note;
        if (smallestnote === null || note.truepos < smallestnote.truepos) smallestnote = note;
        return total + note.truepos;
    }, 0) / beamed_notes.length;

    var upstem = (average_pitch < POS_SWITCH);

    var importantNote = upstem ? highestnote : smallestnote;
    var mult = upstem ? -STEM_LENGTH : STEM_LENGTH;

    var averageYs = beamed_notes.map(function(a) {
        return a.truepos - average_pitch;
    });

    var xSpan = (beamed_notes[beamed_notes.length - 1].x - beamed_notes[0].x);
    var xMid = beamed_notes[0].x + (xSpan / 2);
    var averageXs = beamed_notes.map(function(a, i) {
        return a.x - xMid;
    });

    var topM = 0,
        bottomM = 0;

    for (var i = 0; i < beamed_notes.length; i++) {
        topM += (averageXs[i] * averageYs[i]);
        bottomM += (averageXs[i] * averageXs[i]);
    }

    var m = upstem ? -(topM / bottomM) : (topM / bottomM);

    var
        startX = beamed_notes[0].x,
        startXDist = importantNote.x - startX,
        startY = sigmoid(importantNote.y + (startXDist * m) + mult),
        endX = beamed_notes[beamed_notes.length - 1].x,
        endXDist = endX - importantNote.x,
        endY = sigmoid(importantNote.y + (endXDist * m) + mult),
        grad = (endY - startY) / (endX - startX);

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

        note.svg.stem = note.svg.line(0, 8, 0, -((note.y - startY) + ((note.x - startX) * grad))).stroke({
            width: 1,
            color: 'black'
        });
        if (upstem) {
            note.svg.dot.move(-10, 4);
        } else {
            note.svg.dot.move(0, 4);
        }
    });
}

/**
 * [keysig description]
 * @param  {[type]} draw   [description]
 * @param  {[type]} keysig [description]
 * @return {[type]}        [description]
 */
drawing_functions.keysig = function(draw, keysig) {
    var accidentals = data_tables.keySig[keysig.note][keysig.mode];
    var xoffset = draw.bbox().x2 + 6;
    if (accidentals === 0) return;
    var dataset = accidentals > 0 ? data_tables.sharps : data_tables.flats;
    var symbol = accidentals > 0 ? glyphs["accidentals.sharp"].d : glyphs["accidentals.flat"].d;
    for (var i = 0; i < Math.abs(accidentals); i++) {
        draw.path(symbol).attr({
            fill: 'black'
        }).move(xoffset + i * 8, 32 - ((dataset[i] + 1) * 4));
    }
}

module.exports = drawing_functions;