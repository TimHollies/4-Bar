define([
    "vendor/lodash/dist/lodash"
], function(_) {
    'use strict';

    var lookup = {
        'C': 0,
        'D': 2,
        'E': 4,
        'F': 5,
        'G': 7,
        'A': 9,
        'B': 11
    };

    function noteToABC(note) {
        note.note.actualPitch = lookup[note.note.pitch] + (note.note.octave * 12);
        if (note.accidental != undefined) {
            note.note.actualPitch += note.accidental;
        }
        return note;
    }

    function lineToABC(line) {
        return _(line).map(function(item) {
            if (item.type === "note") {
                return noteToABC(item);
            }
            return item;
        });
    }

    function processTune(tune) {
        return _(tune).map(function(item) {
            if (item.type === undefined) {
                return lineToABC(item);
            }
            return item;
        });
    }

    return {
        "process": processTune,
    };
});