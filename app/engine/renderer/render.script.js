define([
    "vendor/lodash/dist/lodash"
], function(_) {
    'use strict';

    var lookup = ["C", "^C", "D", "^D", "E", "F", "^F", "G", "^G", "A", "^A", "B"];

    function noteToABC(note) {
        var octaveModifier = Math.floor(note.note.actualPitch / 12);
        var remainder = note.note.actualPitch - (octaveModifier * 12);
        octaveModifier -= 4;

        var noteLetter = lookup[remainder];

        if (octaveModifier > 0) {
            noteLetter = noteLetter.toLowerCase();
            octaveModifier -= 1;
        }

        while (octaveModifier > 0) {
            noteLetter += "'";
            octaveModifier -= 1;
        }

        while (octaveModifier < 0) {
            noteLetter += ",";
            octaveModifier += 1;
        }

        if (note.duration != 1) {
            noteLetter += note.duration;
        }
        return noteLetter;
    }

    var hashTable = {
        "note": noteToABC,
        "barline": function(a) {
            return a.symbol;
        },
        "header": function(a) {
            return a.key + ": " + a.data;
        },
        " ": function() {
            return " ";
        },
        "chord": function(a) {
            return a.note;
        },
        "-": function() { return "-"; },
        "timebar": function(a) { return "[" + a.time; }

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
            if (item.type === undefined) {
                return lineToABC(item);
            }
            return symbolToABC(item);
        }).join('\n');
    }

    return {
        "symbolToABC": symbolToABC,
        "lineToABC": lineToABC,
        "tuneToABC": tuneToABC
    };
});