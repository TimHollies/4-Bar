'use strict';

var data_tables = {},
    dispatcher = require('./dispatcher'),
    zazate = require('vendor').zazate,
    _ = require('vendor').lodash;

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
        return Math.log(note.noteLength + 1);
        //return note.noteLength * 1;//* 1.618;
    },
    "rest": 1,
    "beat_rest": 1,
    "barline": 1,
    "space": 0,
    "chord_annotation": 0
};

data_tables.mode_map = {
    "": "maj",
    "ion": "maj",
    "maj": "maj",

    "m": "min",
    "min": "min",
    "aeo": "min",

    "mix": "mix",
    "dor": "dor",
    "phr": "phr",
    "lyd": "lyd",
    "loc": "loc"
};

data_tables.keySig = {
    "C": {
        "maj": "0",
        "min": "-3",
        "mix": "-1",
        "dor": "-2",
        "phr": "-4",
        "lyd": "1",
        "loc": "-5"
    },
    "C#": {
        "maj": "7",
        "min": "4",
        "mix": "6",
        "dor": "5",
        "phr": "3",
        "lyd": "NOPE",
        "loc": "2"
    },
    "Db": {
        "maj": "-5",
        "min": "NOPE",
        "mix": "-6",
        "dor": "-7",
        "phr": "NOPE",
        "lyd": "-4",
        "loc": "NOPE"
    },
    "D": {
        "maj": "2",
        "min": "-1",
        "mix": "1",
        "dor": "0",
        "phr": "-2",
        "lyd": "3",
        "loc": "-3"
    },
    "D#": {
        "maj": "6",
        "min": "NOPE",
        "mix": "NOPE",
        "dor": "7",
        "phr": "5",
        "lyd": "",
        "loc": "4"
    },
    "Eb": {
        "maj": "-3",
        "min": "-6",
        "mix": "-4",
        "dor": "-5",
        "phr": "-7",
        "lyd": "-2",
        "loc": "NOPE"
    },
    "E": {
        "maj": "4",
        "min": "1",
        "mix": "3",
        "dor": "2",
        "phr": "0",
        "lyd": "5",
        "loc": "-1"
    },
    "E#": {
        "maj": "NOPE",
        "min": "NOPE",
        "mix": "NOPE",
        "dor": "NOPE",
        "phr": "7",
        "lyd": "NOPE",
        "loc": "6"
    },
    "Fb": {
        "maj": "NOPE",
        "min": "NOPE",
        "mix": "NOPE",
        "dor": "NOPE",
        "phr": "NOPE",
        "lyd": "-7",
        "loc": "NOPE"
    },
    "F": {
        "maj": "-1",
        "min": "-4",
        "mix": "-2",
        "dor": "-3",
        "phr": "-5",
        "lyd": "0",
        "loc": "-6"
    },
    "F#": {
        "maj": "6",
        "min": "3",
        "mix": "5",
        "dor": "4",
        "phr": "2",
        "lyd": "7",
        "loc": "1"
    },
    "Gb": {
        "maj": "-6",
        "min": "NOPE",
        "mix": "-7",
        "dor": "NOPE",
        "phr": "NOPE",
        "lyd": "-5",
        "loc": "NOPE"
    },
    "G": {
        "maj": "1",
        "min": "-2",
        "mix": "0",
        "dor": "-1",
        "phr": "-3",
        "lyd": "2",
        "loc": "-4"
    },
    "G#": {
        "maj": "NOPE",
        "min": "5",
        "mix": "7",
        "dor": "6",
        "phr": "4",
        "lyd": "NOPE",
        "loc": "3"
    },
    "Ab": {
        "maj": "-4",
        "min": "-7",
        "mix": "-5",
        "dor": "-6",
        "phr": "NOPE",
        "lyd": "-3",
        "loc": "NOPE"
    },
    "A": {
        "maj": "3",
        "min": "0",
        "mix": "2",
        "dor": "1",
        "phr": "-1",
        "lyd": "4",
        "loc": "-2"
    },
    "A#": {
        "maj": "NOPE",
        "min": "7",
        "mix": "NOPE",
        "dor": "NOPE",
        "phr": "6",
        "lyd": "NOPE",
        "loc": "5"
    },
    "Bb": {
        "maj": "-2",
        "min": "-5",
        "mix": "-3",
        "dor": "-4",
        "phr": "-6",
        "lyd": "-1",
        "loc": "-7"
    },
    "B": {
        "maj": "5",
        "min": "2",
        "mix": "4",
        "dor": "3",
        "phr": "1",
        "lyd": "6",
        "loc": "0"
    },
    "B#": {
        "maj": "NOPE",
        "min": "NOPE",
        "mix": "NOPE",
        "dor": "NOPE",
        "phr": "NOPE",
        "lyd": "NOPE",
        "loc": "7"
    },
    "Cb": {
        "maj": "-7",
        "min": "NOPE",
        "mix": "NOPE",
        "dor": "NOPE",
        "phr": "NOPE",
        "lyd": "-6",
        "loc": "NOPE"
    }
};

var majorMode = {
    "-7": "Cb",
    "-6": "Gb",
    "-5": "Db",
    "-4": "Ab",
    "-3": "Eb",
    "-2": "Bb",
    "-1": "F",
    "0": "C",
    "1": "G", 
    "2": "D",
    "3": "A",
    "4": "E",
    "5": "B",
    "6": "F#",
    "7": "C#"
};

data_tables.normaliseMode = (mode) => mode.toLowerCase().substr(0, 3);

window.toMajorMode = (note, mode) => {
    var norm = data_tables.normaliseMode(mode);
    var middle = data_tables.mode_map[norm];
    var key = majorMode[data_tables.keySig[note][middle]];

    var chords = [];

    chords.push(zazate.chords.I(key));
    chords.push(zazate.chords.II(key));
    chords.push(zazate.chords.III(key));
    chords.push(zazate.chords.IV(key));
    chords.push(zazate.chords.V(key));
    chords.push(zazate.chords.VI(key));
    chords.push(zazate.chords.VII(key));

    var indexOfRootNote = _.findIndex(chords, (c) => c[0] === note);

    while(indexOfRootNote > 0) {
        indexOfRootNote--;
        chords.push(chords.shift());
    }

    return chords.map((c) => zazate.chords.determine(c, true)[0]);
};

window.gkm = data_tables.getKeyModifiers = (key) => {
    var norm = data_tables.normaliseMode(key.mode);
    var middle = data_tables.mode_map[norm];
    var meh = parseInt(data_tables.keySig[key.note][middle]);

    console.log(meh);

    if(meh > 0) {
        var range = _.range(-1, meh-1);
        return {
            mod: 1,
            notes: range.map((r) => majorMode[r])
        };
    }

    if(meh < 0) {
        var range = _.range(5, meh+5, -1);
        return {
            mod: -1,
            notes: range.map((r) => majorMode[r])
        }
    }

    return {
        mod: 0,
        notes: []
    };
};


data_tables.getKeySig = (note, mode) => {
    var 
        normalisedMode = data_tables.mode_map[data_tables.normaliseMode(mode)];

    return parseInt(data_tables.keySig[note][normalisedMode]);
};

data_tables.flats = [6, 9, 5, 8, 4, 7, 3];
data_tables.sharps = [10, 7, 11, 8, 5, 9, 6];

//not all note lengths can be represented with a single note
data_tables.allowed_note_lengths = [1, 2, 3, 4, 6, 7, 8, 12, 14, 16, 24, 28];

module.exports = data_tables;