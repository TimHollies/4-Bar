'use strict';

var
    _ = require('vendor').lodash,
    Lexer = require('vendor').lex;

//////////////////////
// HELPER FUNCTIONS //
//////////////////////
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


////////////////////////////////
//            LEXER           //
////////////////////////////////

var lexer = new Lexer;

///////////
// NOTES //
///////////
lexer.addRule(/([A-Ga-g])/, function(note) {
    return {
        type: "note",
        subType: "letter",
        data: note
    }
});

///////////
// RESTS //
///////////
lexer.addRule(/z/, function() {
    return {
        type: "rest",
        subType: "visible",
        data: "short"
    }
}).addRule(/x/, function() {
    return {
        type: "rest",
        subType: "invisible",
        data: "short"
    }
}).addRule(/Z/, function() {
    return {
        type: "rest",
        subType: "visible",
        data: "long"
    }
}).addRule(/X/, function() {
    return {
        type: "rest",
        subType: "invisible",
        data: "long"
    }
});

///////////////////////////////
// NOTE AND REST DECORATIONS //
///////////////////////////////
lexer.addRule(/([0-9]+)\/?([0-9]+)?/, function(all, notelength, notedenom) {
    return {
        type: "note",
        subType: "length",
        data: notedenom && notedenom.length > 0 ? parseFloat(notelength) / parseFloat(notedenom) : parseInt(notelength),
    }
}).addRule(/([',]+)/, function(pitchModifier) {
    return {
        type: "note",
        subType: "pitch",
        data: charCountInString(pitchModifier, "'") - charCountInString(pitchModifier, ",")
    }
}).addRule(/(_|\^|=|__|\^\^)/, function(accidental) {
    return {
        type: "note",
        subType: "accidental",
        data: accidental
    }
}).addRule(/"([^"]+)"/, function(match, data) {
    return {
        type: "chord_annotation",
        data: data
    }
}).addRule(/!([^!]+)!/, function(data) {
    return {
        type: "decoration",
        data: data
    }
}).addRule(/~/, function(data) {
    return {
        type: "decoration",
        data: data
    }
});

///////////////
// BAR LINES //
///////////////
lexer.addRule(/\|/, function() {
    return {
        type: "barline",
        subtype: "normal"
    }
}).addRule(/\|\]/, function() {
    return {
        type: "barline",
        subtype: "heavy_end"
    }
}).addRule(/\|\|/, function() {
    return {
        type: "barline",
        subtype: "double"
    }
}).addRule(/\[\|/, function() {
    return {
        type: "barline",
        subtype: "heavy_start"
    }
}).addRule(/:\|/, function() {
    return {
        type: "barline",
        subtype: "repeat_end"
    }
}).addRule(/\|:/, function() {
    return {
        type: "barline",
        subtype: "repeat_start"
    }
}).addRule(/::/, function() {
    return {
        type: "barline",
        subtype: "double_repeat"
    }
});

/////////////////
// NOTE GROUPS //
/////////////////
lexer.addRule(/\[/, function() {
    return {
        type: "chord_start"
    }
}).addRule(/\]/, function() {
    return {
        type: "chord_stop"
    }

}).addRule(/{/, function() {
    return {
        type: "grace_start"
    }
}).addRule(/}/, function() {
    return {
        type: "grace_stop"
    }
}).addRule(/\(/, function() {
    return {
        type: "slur_start"
    }
}).addRule(/\)/, function() {
    return {
        type: "slur_stop"
    }
});

//////////////////
// DATA FIELDS  //
//////////////////

lexer.addRule(/T: *([\w ]+)(?:\n|$)/, function(match, title) {
    return {
        type: "data",
        subtype: "title",
        data: title
    }
});

lexer.addRule(/X: *([0-9]+)(?:\n|$)/, function(match, num) {
    return {
        type: "data",
        subtype: "number",
        data: num
    }
});

lexer.addRule(/R: *([\w ]+)(?:\n|$)/, function(match, rhythm) {
    return {
        type: "data",
        subtype: "rhythm",
        data: rhythm
    }
});

lexer.addRule(/M: *([0-9]+)\/([0-9])(?:\n|$)/, function(match, top, bottom) {
    return {
        type: "data",
        subtype: "timesig",
        data: {
            top: top,
            bottom: bottom
        }
    }
});

lexer.addRule(/L: *([0-9]+)\/([0-9])(?:\n|$)/, function(match, top, bottom) {
    return {
        type: "data",
        subtype: "notelength",
        data: parseInt(top) / parseInt(bottom)
    }
});

lexer.addRule(/K: *([\w ]+)(?:\n|$)/, function(match, key) {
    return {
        type: "data",
        subtype: "key",
        data: key
    }
});

///////////
// OTHER //
///////////
lexer.addRule(/ /, function() {
    return {
        type: "space"
    }
}).addRule(/`/, function() {
    return {
        type: "beam"
    }
});

module.exports = function(input) {
    lexer.setInput(input);
    var output = [];
    for(var i=0, data = lexer.lex(); data != undefined; data = lexer.lex()) {
        output[i] = data;
        i++;
    }
    return output;
};