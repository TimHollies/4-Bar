'use strict';

import s from 'virtual-dom/virtual-hyperscript/svg';
import _ from 'lodash';
import glyphs from './glyphs';
import { data_tables } from '../data/data_tables';
//import randomColor from 'randomcolor';

export let drawing_functions = {};
    //dispatcher = require("../dispatcher");

var
    POS_SWITCH = 6,
    MAX_GRAD = 0.05, 
    STEM_LENGTH = 28;

var transpose = 0;
// dispatcher.on("transpose_change", function(data) {
//     transpose = data;
// });

/**
 * Draws a stave of width 'width'
 * @param  {SVG.Group} line  [line group to draw the stave in]
 * @param  {Number} width [width of line]
 * @return {Undefined}
 */

var staveObject = s("path", {
    stroke: "black",
    d: glyphs.stave.d
});

drawing_functions.stave = function() {
    return staveObject;
}

function ledgerLineCount(a) {
    return ((Math.abs(a) / 2) >> 0) + 1;
}

function drawLedgerLines(currentNote, offset, colGroup) {
    if (currentNote.truepos < 1) {
        for (var i = 0, tar = ledgerLineCount(currentNote.truepos); i < tar; i++) {
            colGroup.children.push(s("path", {
                stroke: 'black',
                d: "M0 0L14 0",
                transform: `translate(-2, ${32 + 8 * (i + 1)})`
            }));
        }
    }

    if (currentNote.truepos > 11) {
        for (var i = 0, tar = ledgerLineCount(currentNote.truepos-12); i < tar; i++) {
            colGroup.children.push(s("path", {
                stroke: 'black',
                d: "M0 0L14 0",
                //transform: `translate(6, ${0 - (8 * (i + 1))})`
                transform: `translate(-2, ${0 - (8 * (i + 1))})`
            }));
        }
    }
}

drawing_functions.note = function (currentNote, offset, noteAreaWidth) {

    //return;   

    var colGroup = s("g", {
        transform: `translate(${offset},0)`
    });

    /*
    var color = '#000',
        stem_end = {
            x: 0,
            y: 0
        },
        stem_tail = null,
        stem = null;

    //invalid note length?
    if (data_tables.allowed_note_lengths.indexOf(currentNote.notelength) === -1) {
        console.log("INVALID NOTE LENGTH");
        for (var i = 0; i < data_tables.allowed_note_lengths.length; i++) {
            if (currentNote.notelength > data_tables.allowed_note_lengths[i]) {
                currentNote.notelength = data_tables.allowed_note_lengths[i - 1];
                break;
            }
        }
    }*/

    if(currentNote.chord !== "") {
        colGroup.children.push(s("text", {
           x: 0,
           y: -20,
           fill: "black",
           transform: "scale(0.8, 0.8)"
        }, [currentNote.chord.getText(transpose)]));
    }

    //ledger line
    drawLedgerLines(currentNote, offset, colGroup);

    var downstem = (currentNote.truepos >= POS_SWITCH || currentNote.forceStem === 1) && !(currentNote.forceStem === -1);

    //DECORATIONS
    if(currentNote.decorations.length > 0) {
        for(var i=0; i<currentNote.decorations.length; i++) {
            switch(currentNote.decorations[i].data) {
                case "~": {
                    var transform = "";

                    var relativePositioning = downstem ? currentNote.y > 4 : currentNote.y > 16;

                    if(relativePositioning) {
                        transform = "translate(0, -6)";
                    } else {
                        transform = `translate(0, ${currentNote.y - 10})`
                    }
                    colGroup.children.push(s("path", {
                            d: glyphs["scripts.roll"].d,
                            fill: "black",
                            transform: transform
                        }));
                    break;
                }
            }
        }
    }


    var noteDot, stem, accidental;

    //noteDot = downstem ? s("g", { class: "noteHead", transform: "translate(10,0)"}) : s("g", { class: "noteHead"});
    var elementName = `g#note_${currentNote.renderNoteId}`;
     noteDot = downstem ? s(elementName, { class: "noteHead", transform: "translate(0,0)"}) : s(elementName, { class: "noteHead"});

    //dotted note?
    if ((2 * currentNote.noteLength) % 3 === 0) {
        noteDot.children.push(s("ellipse",{
            rx: 2,
            ry: 2,
            cx: 14,
            cy: currentNote.truepos % 2 === 0 ? -4 : 0,
            fill: 'black'
        }));
    }

    //double dotted note?
    if ((4 * currentNote.noteLength) % 7 === 0) {
        noteDot.children.push(s("ellipse",{
            rx: 2,
            ry: 2,
            cx: 14,
            cy: 0,
            fill: 'black'
        }));
        noteDot.children.push(s("ellipse",{
            rx: 2,
            ry: 2,
            cx: 18,
            cy: 0,
            fill: 'black'
        }));
    }    

    var dotType;
    //dot type
    if (currentNote.noteLength < 4) {
        dotType = glyphs["noteheads.quarter"].d;
    } else {
        if (currentNote.noteLength < 8) {
            dotType = glyphs["noteheads.half"].d;
        } else {
            dotType = glyphs["noteheads.whole"].d;
        }
    }

    noteDot.children.push(s("path", {
        d: dotType
    }));

    
    if (currentNote.noteLength < 8) {
        if (downstem) {

            //basic stem
            stem = s("g", {
                transform: "translate(0, 0)"
            });       
 
            if(!currentNote.beamed) {
                stem.children.push(s("path", {
                    stroke: 'black',
                    d: `M0 ${currentNote.y+2}L0 ${currentNote.y + 28}`
                }));

                if(currentNote.noteLength === 1) {
                    stem.children.push(s("path", {
                        d: glyphs["flags.d8th"].d,
                        fill: 'black',
                        transform: `translate(0,${currentNote.y + 28})`
                    }));
                }
            } else {
                stem.children.push(s("path", {
                    stroke: 'black',
                    d: `M0 ${currentNote.y}L0 ${currentNote.beamOffsetFactor}`
                }));
            }

        } else {

            stem = s("g", {
                transform: "translate(10, 0)"
            });
        
            if(!currentNote.beamed) {
                stem.children.push(s("path", {
                    stroke: 'black',
                    d: `M0 ${currentNote.y-3}L0 ${currentNote.y - 32}`
                }));

                if(currentNote.noteLength === 1) {
                    stem.children.push(s("path", {
                        d: glyphs["flags.u8th"].d,
                        fill: 'black',
                        transform: `translate(0,${currentNote.y - 34})`
                    }));
                }
            } else {
                stem.children.push(s("path", {
                    stroke: 'black',
                    d: `M0 ${currentNote.y-3}L0 ${currentNote.beamOffsetFactor}`
                }));
            }

            /*
            //curly bit for quavers            
            if (currentNote.notelength == 1) {
                stem_tail = noteGroup.path(glyphs["flags.u8th"].d).attr({
                    fill: 'black'
                }).move(0, -24).scale(1);
            }

            //store point
            stem_end.y = -24;*/
        }
    }

    //accidentals

    switch (currentNote.accidental) {
        case "_":
            accidental = s("path", {
                d: glyphs["accidentals.flat"].d,
                fill: "black",
                transform: "translate(-8, 0)"
            });
            break;
        case "^":
            accidental = s("path", {
                d: glyphs["accidentals.sharp"].d,
                fill: "black",
                transform: "translate(-10, 0)"
            });           
            break;
        case "=":
            accidental = s("path", {
                d: glyphs["accidentals.nat"].d,
                fill: "black",
                transform: "translate(-7, 0)"
            });
            break;
        case "__":
            accidental = s("path", {
                d: glyphs["accidentals.dblflat"].d,
                fill: "black",
                transform: "translate(-6,-12)"
            });
            break;
        case "^^":
            accidental = s("path", {
                d: glyphs["accidentals.dblsharp"].d,
                fill: "black",
                transform: "translate(-6,-12)"
            });
            break;
        default:
    }/*

    currentNote.stem_end = stem_end;

    noteGroup.stem_tail = stem_tail;
    noteGroup.stem = stem;
    noteGroup.dot = noteDot;
    currentNote.truepos = truepos;


    currentNote.x = totalOffset;
    currentNote.y = 28 - (truepos * 4);

    noteGroup.move(currentNote.x, currentNote.y);*/

    var noteGroup = s("g", {
        transform: `translate(0,${currentNote.y})`
    }, [noteDot, accidental]);    

    colGroup.children.push(noteGroup, stem);

    if(currentNote.beams.length > 0) {
        for(var i=0; i<currentNote.beams.length; i++) {
            drawing_functions.beam(currentNote.beams[i], colGroup, noteAreaWidth);
        }
    }

    return colGroup;
};

drawing_functions.barline = function(currentSymbol, offset) {
    var 
        barlineGroup = s("g");

    var rightAligned = currentSymbol.align === 2;

    switch (currentSymbol.subType) {
        case "normal":
            barlineGroup.children.push(s("rect", {
                x: offset + 4 + (rightAligned ? 4 : 0),
                width: 1,
                height: 32,
                fill: 'black'
            }));
            break;
        case "double":
            var alignment = currentSymbol.align === 2 ? -2 : 0;
            barlineGroup.children.push(s("rect", {
                x: offset - 2 + alignment,
                width: 1,
                height: 32,
                fill: 'black'
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 2 + alignment,
                width: 1,
                height: 32,
                fill: 'black'
            }));
            break;

        case "repeat_start":

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 12,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 20,
                fill: 'black'
            }));

        case "heavy_start":

            barlineGroup.children.push(s("rect", {
                x: offset - 2,
                width: 4,
                height: 32,
                fill: 'black'
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 6,
                width: 1,
                height: 32,
                fill: 'black'
            }));
            break;

        case "repeat_end":

            var alignment = currentSymbol.align === 2 ? -6 : 0;

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset - 12 + 20,
                cy: 12,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset - 12 + 20,
                cy: 20,
                fill: 'black'
            }));

        case "heavy_end":

            var alignment = currentSymbol.align === 2 ? -6 : 0;

            barlineGroup.children.push(s("rect", {
                x: offset + 2 + 20 + alignment,
                width: 4,
                height: 32,
                fill: 'black'
            }));
            barlineGroup.children.push(s("rect", {
                x: offset - 2 + 20  + alignment,
                width: 1,
                height: 32,
                fill: 'black'
            }));
            break; 

        case "double_repeat":
            barlineGroup.children.push(s("rect", {
                x: offset - 2,
                width: 4,
                height: 32,
                fill: 'black'
            }));
            barlineGroup.children.push(s("rect", {
                x: offset + 5,
                width: 1,
                height: 32,
                fill: 'black'
            }));
            barlineGroup.children.push(s("rect", {
                x: offset - 6,
                width: 1,
                height: 32,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 12,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset + 12,
                cy: 20,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 12,
                fill: 'black'
            }));

            barlineGroup.children.push(s("ellipse",{
                rx: 2,
                ry: 2,
                cx: offset - 12,
                cy: 20,
                fill: 'black'
            }));
            break;

        default:
    }

    return barlineGroup;
};

drawing_functions.chord_annotation = function(line, currentSymbol, totalOffset) {
   /* return line.text(currentSymbol.text).font({
        family: 'Helvetica',
        size: 16,
        anchor: 'middle',
        leading: '1.5em'
    }).move(totalOffset, -30).attr({
        fill: 'black'
    });*/
};

drawing_functions.tie = function(currentSymbol, ignore, noteAreaWidth) {

    var 
        startX = currentSymbol.start.xp * noteAreaWidth+4,
        startY = currentSymbol.start.y + 8,
        endX = currentSymbol.end.xp * noteAreaWidth+4,
        endY = currentSymbol.end.y + 8;
 
    var path = `M${startX} ${startY}C${startX+4} ${startY+14}, ${endX - 4} ${endY + 14}, ${endX} ${endY}C${endX+4} ${endY+12}, ${startX - 4} ${startY + 12}, ${startX} ${startY}`;

    return s("path", {
        d: path,
        stroke: 'black'
    });
};

drawing_functions.space = function() {
    return s("g");
}

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

var trebleClefObject = s("path", {
    fill: "black",
    d: glyphs["clefs.G"].d,
    transform: "translate(8, 24)"
});

drawing_functions.treble_clef = function(line) {
    return {
        node: trebleClefObject,
        width: 40
    };
}

/**
 * [timesig description]
 * @param  {[type]} line   [description]
 * @param  {[type]} top    [description]
 * @param  {[type]} bottom [description]
 * @return {[type]}        [description]
 */
drawing_functions.timesig = function(top, bottom, xoffset) {

    var top_group = s("g"),
        bottom_group = s("g"),
        timeSig = s("g", [top_group, bottom_group]);
    //top

    top.toString().split('').forEach(function(num, i) {
        top_group.children.push(s("path", {
            fill: "black",
            d: glyphs[num].d,
            transform: ["translate(", xoffset + (i * 10), ",16)"].join('')
        }));
    });

    bottom.toString().split('').forEach(function(num, i) {
        bottom_group.children.push(s("path", {
            fill: "black",
            d: glyphs[num].d,
            transform: ["translate(", xoffset + (i * 10), ",32)"].join('')
        }));
    });
    /*
    var top_width = top_group.bbox().width,
        bottom_width = bottom_group.bbox().width;

    if (top_width > bottom_width) {
        bottom_group.move((top_width - bottom_width) / 2, 0);
    } else {
        top_group.move((bottom_width - top_width) / 2, 0);
    }
*/
    return {
        node: timeSig,
        width: 24
    };
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
drawing_functions.beam = function(beam, group, noteAreaWidth) {

    //var startX = -((beam.notes[beam.count - 1].xp - beam.notes[0].xp) * noteAreaWidth) + (beam.downBeam ? 0 : 10);
    var startX = -(beam.notes[beam.count - 1].renderedXPos - beam.notes[0].renderedXPos) + (beam.downBeam ? 0 : 10);
    var endY = beam.notes[beam.count - 1].beamOffsetFactor; 
    var startY = beam.notes[0].beamOffsetFactor;

    if(beam.downBeam) {
        group.children.push(s("path", {
            //d: `M${startX} ${startY}L10 ${endY}L10 ${endY-4}L${startX} ${startY-4}L${startX} ${startY}Z`
            d: `M${startX} ${startY}L0 ${endY}L0 ${endY-4}L${startX} ${startY-4}L${startX} ${startY}Z`
        }));
    } else {
        group.children.push(s("path", {
            d: `M${startX} ${startY}L10 ${endY}L10 ${endY+4}L${startX} ${startY+4}L${startX} ${startY}Z`
        }));
    }

    for(var i=0; i<beam.notes.length; i++) {

        var bm = beam.notes[i];

        if(bm.beamDepth < -1) {

            var tailsToDraw = Math.abs(bm.beamDepth) - 1;

            for(var j=0; j<tailsToDraw; j++) {
                var notePos = -(beam.notes[beam.count - 1].xp - bm.xp) * noteAreaWidth + (beam.downBeam ? 0 : 10);
                var tailPosY = bm.beamOffsetFactor+6+(j*6);
                group.children.push(s("path", {
                    d: `M${notePos} ${tailPosY}L${notePos} ${tailPosY+4}L${notePos-4} ${tailPosY+4}L${notePos-4} ${tailPosY}L${notePos} ${tailPosY}Z`
                }));
            }
        }
    }
}

/**
 * [keysig description]
 * @param  {[type]} draw   [description]
 * @param  {[type]} keysig [description]
 * @return {[type]}        [description]
 */
drawing_functions.keysig = function(keysig, xoffset, lineId, transpose) {

    var keySigGroup = s("g");
    var undefined;

    var accidentals = data_tables.getKeySig(keysig.note, keysig.mode) + transpose;

    
    //dispatcher.send("remove_abc_error", "KEYSIG");

    if(_.isNaN(accidentals)) {
        var error = {
            line: lineId,
            message: `Malformed key signature: ${keysig.note + keysig.mode}`,
            severity: 1,
            type: "KEYSIG"
        };

        console.log(error);

        //dispatcher.send("abc_error", error);

        return false;
    }

    if (accidentals === 0) return {
        node: keySigGroup,
        width: 0
    };

    var dataset = accidentals > 0 ? data_tables.sharps : data_tables.flats;
    var symbol = accidentals > 0 ? glyphs["accidentals.sharp"].d : glyphs["accidentals.flat"].d;    

    for (var i = 0; i < Math.abs(accidentals); i++) {

        keySigGroup.children.push(s("path", {
            d: symbol,
            fill: "black",
            transform: `translate(${xoffset + i * 8}, ${44 - ((dataset[i] + 1) * 4)})`
        }));
    }

    return {
        node: keySigGroup,
        width: (Math.abs(accidentals) * 10) + 12
    };
};

drawing_functions.varientEndings = function (currentEnding, noteAreaWidth, continuation) {
    var
        startX = currentEnding.start.renderedXPos,//(currentEnding.start.xp * noteAreaWidth) - 8,
        endX = currentEnding.end === null ? noteAreaWidth : currentEnding.end.renderedXPos,
        path = "";
        //path = `M${startX} -25L${startX} -40L${endX} -40L${endX} -25`;

    path = continuation ? `M${startX} -40` : `M${startX} -25L${startX} -40`;
    path = path + `L${endX} -40`;
    path = currentEnding.end === null ? path : path + `L${endX} -25`;

    var endingGroup = s("g");

    endingGroup.children.push(s("path", {
        d: path,
        stroke: 'black',
        fill: 'none'
    }));

    endingGroup.children.push(s("text", {
       x: 0,
       y: 0,
       fill: "black",
       transform: `translate(${startX + 4}, -30)scale(0.5, 0.5)`
    }, [currentEnding.name]));

    return endingGroup;
};

drawing_functions.slur = function(currentSymbol, ignore, noteAreaWidth) {

    var 
        startX = currentSymbol.notes[0].xp * noteAreaWidth+4,
        startY = currentSymbol.notes[0].y + 8,
        endX = currentSymbol.notes[currentSymbol.notes.length - 1].xp * noteAreaWidth+4,
        endY = currentSymbol.notes[currentSymbol.notes.length - 1].y + 8;
 
    var path = `M${startX} ${startY}C${startX+4} ${startY+14}, ${endX - 4} ${endY + 14}, ${endX} ${endY}C${endX+4} ${endY+12}, ${startX - 4} ${startY + 12}, ${startX} ${startY}`;

    return s("path", {
        d: path,
        stroke: 'black'
    });
};

var restLengthMap = {
    "0.125": "rests.64th",
    "0.25": "rests.32th",
    "0.5": "rests.16th",
    "1": "rests.8th",
    "2": "rests.quarter",
    "4": "rests.half",
    "8": "rests.whole",
};

drawing_functions.rest = function(currentNote, offset, noteAreaWidth) {

    var restLength = currentNote.restLength === undefined ? 1 : currentNote.restLength;

    var colGroup = s("g", {
        transform: `translate(${offset},16)`
    });

    if(!currentNote.visible) return colGroup;

    colGroup.children.push(s("path", {
        d: glyphs[restLengthMap[restLength]].d
    }));

    return colGroup;
}

drawing_functions.tuplets = function(currentTuplet, noteAreaWidth) {

    var middle = (currentTuplet.notes.length - 1) / 2;

    var offset = currentTuplet.notes[middle].renderedXPos + (currentTuplet.notes[middle].forceStem === -1 ? 10 : 0);//xp * noteAreaWidth;

    var tupletNumberY = currentTuplet.notes[middle].forceStem === -1 ?
        currentTuplet.notes[middle].beamOffsetFactor - 10 :
        currentTuplet.notes[middle].beamOffsetFactor + 10;

    var colGroup = s("g", {
        transform: `translate(${offset},${tupletNumberY})`
    });

    colGroup.children.push(s("text", {
       x: 0,
       y: 0,
       "text-anchor": "middle",
       fill: "black",
       transform: "scale(0.5, 0.5)",
       "font-weight": "bold"
    }, [currentTuplet.value.toString()]));

    return colGroup;
}