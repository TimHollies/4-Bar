define([
    "vendor/lodash/dist/lodash"
], function(_) {
    'use strict';

    function noteToABC(note, shift) {
        note.note.actualPitch += shift;
        return note;
    }

    function lineToABC(line, shift) {
        return _(line).map(function(item) {
            if (item.type === "note") {
                return noteToABC(item, shift);
            }
            return item;
        });
    }

    function transposeTune(tune, shift) {
        return _(tune).map(function(item) {
            if (item.type === undefined) {
                return lineToABC(item, shift);
            }
            return item;
        });
    }

    return {
        "transpose": transposeTune,
    };
});