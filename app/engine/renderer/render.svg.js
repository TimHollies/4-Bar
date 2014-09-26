define([
    "vendor/lodash/dist/lodash",
    "vendor/svgjs/svg"
], function(_) {
    'use strict';

    function noteToABC(note) {
        var noteLetter = note.note.pitch;
        if (note.duration != 1) {
            noteLetter += note.duration;
        }
        return noteLetter;
    }

    var hashTable = {
        "note": noteToABC,
        "barline": function(a) {
            return a.symbol;
        }
    }

    function symbolToABC(symbol) {
        return hashTable[symbol.type](symbol);
    }

    function lineToABC(line) {
        return _(line).map(function(item) {
            return symbolToABC(item);
        }).join('');
    }

    function tuneToABC(tune) {
        return _(tune).map(function(item) {
            return lineToABC(item);
        }).join('');
    }

    return {
        "symbolToABC": symbolToABC,
        "lineToABC": lineToABC,
        "tuneToABC": tuneToABC
    };
});