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
        pos: 0
    },
    "d": {
        octave: 5,
        pitch: 62,
        pos: 1
    },
    "e": {
        octave: 5,
        pitch: 64,
        pos: 2
    },
    "f": {
        octave: 5,
        pitch: 65,
        pos: 3
    },
    "g": {
        octave: 5,
        pitch: 67,
        pos: 4
    },
    "a": {
        octave: 5,
        pitch: 69,
        pos: 5
    },
    "b": {
        octave: 5,
        pitch: 71,
        pos: 6
    },
};

data_tables.symbol_width = {
    "note": function(note) {
        return note.noteLength * 1.618;
    },
    "rest": 1,
    "beat_rest": 1,
    "barline": 1,
    "space": 0,
    "chord_annotation": 0
};

data_tables.keySig = {
    "C": {
        "Major": "0",
        "Minor": "-3",
        "Mix": "-1",
        "Dor": "-2",
        "Phr": "-4",
        "Lyd": "1",
        "Loc": "-5"
    },
    "C#": {
        "Major": "7",
        "Minor": "4",
        "Mix": "6",
        "Dor": "5",
        "Phr": "3",
        "Lyd": "NOPE",
        "Loc": "2"
    },
    "Db": {
        "Major": "-5",
        "Minor": "NOPE",
        "Mix": "-6",
        "Dor": "-7",
        "Phr": "NOPE",
        "Lyd": "-4",
        "Loc": "NOPE"
    },
    "D": {
        "Major": "2",
        "Minor": "-1",
        "Mix": "1",
        "Dor": "0",
        "Phr": "-2",
        "Lyd": "3",
        "Loc": "-3"
    },
    "D#": {
        "Major": "6",
        "Minor": "NOPE",
        "Mix": "NOPE",
        "Dor": "7",
        "Phr": "5",
        "Lyd": "",
        "Loc": "4"
    },
    "Eb": {
        "Major": "-3",
        "Minor": "-6",
        "Mix": "-4",
        "Dor": "-5",
        "Phr": "-7",
        "Lyd": "-2",
        "Loc": "NOPE"
    },
    "E": {
        "Major": "4",
        "Minor": "1",
        "Mix": "3",
        "Dor": "2",
        "Phr": "0",
        "Lyd": "5",
        "Loc": "-1"
    },
    "E#": {
        "Major": "NOPE",
        "Minor": "NOPE",
        "Mix": "NOPE",
        "Dor": "NOPE",
        "Phr": "7",
        "Lyd": "NOPE",
        "Loc": "6"
    },
    "Fb": {
        "Major": "NOPE",
        "Minor": "NOPE",
        "Mix": "NOPE",
        "Dor": "NOPE",
        "Phr": "NOPE",
        "Lyd": "-7",
        "Loc": "NOPE"
    },
    "F": {
        "Major": "-1",
        "Minor": "-4",
        "Mix": "-2",
        "Dor": "-3",
        "Phr": "-5",
        "Lyd": "0",
        "Loc": "-6"
    },
    "F#": {
        "Major": "6",
        "Minor": "3",
        "Mix": "5",
        "Dor": "4",
        "Phr": "2",
        "Lyd": "7",
        "Loc": "1"
    },
    "Gb": {
        "Major": "-6",
        "Minor": "NOPE",
        "Mix": "-7",
        "Dor": "NOPE",
        "Phr": "NOPE",
        "Lyd": "-5",
        "Loc": "NOPE"
    },
    "G": {
        "Major": "1",
        "Minor": "-2",
        "Mix": "0",
        "Dor": "-1",
        "Phr": "-3",
        "Lyd": "2",
        "Loc": "-4"
    },
    "G#": {
        "Major": "NOPE",
        "Minor": "5",
        "Mix": "7",
        "Dor": "6",
        "Phr": "4",
        "Lyd": "NOPE",
        "Loc": "3"
    },
    "Ab": {
        "Major": "-4",
        "Minor": "-7",
        "Mix": "-5",
        "Dor": "-6",
        "Phr": "NOPE",
        "Lyd": "-3",
        "Loc": "NOPE"
    },
    "A": {
        "Major": "3",
        "Minor": "0",
        "Mix": "2",
        "Dor": "1",
        "Phr": "-1",
        "Lyd": "4",
        "Loc": "-2"
    },
    "A#": {
        "Major": "NOPE",
        "Minor": "7",
        "Mix": "NOPE",
        "Dor": "NOPE",
        "Phr": "6",
        "Lyd": "NOPE",
        "Loc": "5"
    },
    "Bb": {
        "Major": "-2",
        "Minor": "-5",
        "Mix": "-3",
        "Dor": "-4",
        "Phr": "-6",
        "Lyd": "-1",
        "Loc": "-7"
    },
    "B": {
        "Major": "5",
        "Minor": "2",
        "Mix": "4",
        "Dor": "3",
        "Phr": "1",
        "Lyd": "6",
        "Loc": "0"
    },
    "B#": {
        "Major": "NOPE",
        "Minor": "NOPE",
        "Mix": "NOPE",
        "Dor": "NOPE",
        "Phr": "NOPE",
        "Lyd": "NOPE",
        "Loc": "7"
    },
    "Cb": {
        "Major": "-7",
        "Minor": "NOPE",
        "Mix": "NOPE",
        "Dor": "NOPE",
        "Phr": "NOPE",
        "Lyd": "-6",
        "Loc": "NOPE"
    }
};

data_tables.flats = [6, 9, 5, 8, 4, 7, 3];
data_tables.sharps = [10, 7, 11, 8, 5, 9, 6];

//not all note lengths can be represented with a single note
data_tables.allowed_note_lengths = [1, 2, 3, 4, 6, 7, 8, 12, 14, 16, 24, 28];

module.exports = data_tables;