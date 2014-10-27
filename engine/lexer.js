'use strict';

var
    jslex = require('scripts/jslex/jslex/jslex.js'),
    _ = require('lodash');



var simpleType = function(name) {
    return function() {
        return {
            type: name
        };
    }
}

var charCountInString = function(string, character) {
    return string.split(character).length - 1;
}

var addSimpleStringInformationField = function(spec, key, type) {
    spec.start[key + ": *([^\n]*)\n?"] = function(data) {
        return {
            type_class: "data",
            type: type,
            data: data
        }
    }
}

var spec = {
    "start": {

        // NOTES //
        "([A-Ga-g])": function(note) {
            return {
                type: "note",
                subType: "letter",
                data: note
            }
        },

        // RESTS //
        "z": function() {
            return {
                type: "rest",
                subType: "visible",
                data: "short"
            }
        },
        "x": function() {
            return {
                type: "rest",
                subType: "invisible",
                data: "short"
            }
        },
        "Z": function() {
            return {
                type: "rest",
                subType: "visible",
                data: "long"
            }
        },
        "X": function() {
            return {
                type: "rest",
                subType: "invisible",
                data: "long"
            }
        },

        // NOTE AND REST DECORATIONS //
        "([0-9]+)?/?([0-9]+)?": function(notelength, notedenom) {
            return {
                type: "note",
                subType: "length",
                data: notedenom && notedenom.length > 0 ? parseFloat(notelength) / parseFloat(notedenom) : parseInt(notelength),
            }
        },
        "([',]*)": function(pitchModifier) {
            return {
                type: "note",
                subType: "pitch",
                data: charCountInString(pitchModifier, "'") - charCountInString(pitchModifier, ",")
            }
        },
        "(_|\\^|=|__|\\^\\^)": function(accidental) {
            return {
                type: "note",
                subType: "accidental",
                data: accidental
            }
        },

        "\"([^\"]+)\"": function(data) {
            return {
                type: "chord_annotation",
                data: data
            }
        },

        "!([^!]+)!": function(data) {
            return {
                type: "decoration",
                data: data
            }
        },

        // BAR LINES //
        "\\|": function() {
            return {
                type: "barline"
            }
        },
        "\\|\\]": function() {
            return {
                type: "barline"
            }
        },
        "\\|\\|": function() {
            return {
                type: "barline"
            }
        },
        "\\[\\|": function() {
            return {
                type: "barline"
            }
        },
        ":\\|": function() {
            return {
                type: "barline"
            }
        },
        "\\|:": function() {
            return {
                type: "barline"
            }
        },
        "::": function() {
            return {
                type: "barline"
            }
        },


        // NOTE GROUPS //
        "\\[": function() {
            return {
                type: "chord_start"
            }
        },

        "\\]": function() {
            return {
                type: "chord_stop"
            }
        },

        "{": function() {
            return {
                type: "grace_start"
            }
        },
        "}": function() {
            return {
                type: "grace_stop"
            }
        },

        "\\(": function() {
            return {
                type: "slur_start"
            }
        },
        "\\)": function() {
            return {
                type: "slur_stop"
            }
        },

        "`": function() {
            return {
                type: "beam"
            }
        },

        // OTHER //
        " ": function() {
            return {
                type: "space"
            }
        }
    }
};

addSimpleStringInformationField(spec, "B", "book");
addSimpleStringInformationField(spec, "C", "composer");
addSimpleStringInformationField(spec, "D", "discography");
addSimpleStringInformationField(spec, "F", "file url");
addSimpleStringInformationField(spec, "G", "group");
addSimpleStringInformationField(spec, "H", "history");
addSimpleStringInformationField(spec, "N", "notes");
addSimpleStringInformationField(spec, "O", "origin");
addSimpleStringInformationField(spec, "R", "rhythm");
addSimpleStringInformationField(spec, "r", "remark");
addSimpleStringInformationField(spec, "S", "source");
addSimpleStringInformationField(spec, "T", "title");
addSimpleStringInformationField(spec, "Z", "transcription");

//not quite true..
addSimpleStringInformationField(spec, "M", "meter");
addSimpleStringInformationField(spec, "L", "length");
addSimpleStringInformationField(spec, "K", "key");

spec.start["(.)"] = function(data) {
    return {
        type: "err",
        data: data
    }
}

module.exports = jslex(spec);