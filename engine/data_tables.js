'use strict';

var data_tables = {};

data_tables["notes"] = {
    "C": {
        octave: 4,
        pitch: 60,
        pos: 0
    },
    "D": {
        octave: 4,
        pitch: 62,
        pos: 1
    },
    "E": {
        octave: 4,
        pitch: 64,
        pos: 2
    },
    "F": {
        octave: 4,
        pitch: 65,
        pos: 3
    },
    "G": {
        octave: 4,
        pitch: 67,
        pos: 4
    },
    "A": {
        octave: 4,
        pitch: 69,
        pos: 5
    },
    "B": {
        octave: 4,
        pitch: 71,
        pos: 6
    },
    "c": {
        octave: 5,
        pitch: 60,
        pos: 7
    },
    "d": {
        octave: 5,
        pitch: 62,
        pos: 8
    },
    "e": {
        octave: 5,
        pitch: 64,
        pos: 9
    },
    "f": {
        octave: 5,
        pitch: 65,
        pos: 10
    },
    "g": {
        octave: 5,
        pitch: 67,
        pos: 11
    },
    "a": {
        octave: 5,
        pitch: 69,
        pos: 12
    },
    "b": {
        octave: 5,
        pitch: 71,
        pos: 13
    },
};

data_tables.symbol_width = {
    "note": function(note) {
        return note.notelength;
    },
    "rest": 1,
    "beat_rest": 1,
    "barline": 1
};

module.exports = data_tables;