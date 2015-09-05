'use strict';

import _ from 'lodash';
import Lexer from 'lex';

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



function LexerException(message, line, char) {
    this.message = message;
    this.line = line;
    this.char = char;
    this.name = "LexerException";
}  


////////////////////////////////
//            LEXER           //
////////////////////////////////

let lexer = new Lexer(function (char) {
    throw new LexerException(`Unexpected '${char}'`, 0, this.index);
});

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
        data: (notedenom && notedenom.length > 0) ? parseFloat(notelength) / parseFloat(notedenom) : parseInt(notelength),
    }
}).addRule(/\/([0-9]+)/, function(all, notedenom) {
    return {
        type: "note",
        subType: "length",
        data: 1 / parseFloat(notedenom),
    }
}).addRule(/\/+/, function(all) {
    return {
        type: "note",
        subType: "length",
        data: 1/all.length,
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
        type: "note",
        subType: "chord_annotation",
        data: data
    }
}).addRule(/!([^!]+)!/, function(data) {
    return {
        type: "note",
        subType: "decoration",
        data: data
    }
}).addRule(/~/, function(data) {
    return {
        type: "note",
        subType: "decoration",
        data: data
    }
}).addRule(/>{1,3}/, function(data) {
    return {
        type: "broken-rhythm",
        subType: "right",
        data: data.length
    }
}).addRule(/<{1,3}/, function(data) {
    return {
        type: "broken-rhythm",
        subType: "left",
        data: data.length
    }
});

///////////////
// BAR LINES //
///////////////
///
/// v indicates how the type of barline effects varient endings
/// #0 -> No effect
/// #1 -> Ends a varient ending
/// #2 -> Starts a varient ending
///
lexer.addRule(/\|/, function() {
    return {
        type: "barline",
        subtype: "normal",
        v: 0
    }
}).addRule(/\|\]/, function() {
    return {
        type: "barline",
        subtype: "heavy_end",
        v: 1
    }
}).addRule(/\|\|/, function() {
    return {
        type: "barline",
        subtype: "double",
        v: 1
    }
}).addRule(/\[\|/, function() {
    return {
        type: "barline",
        subtype: "heavy_start",
        v: 1
    }
}).addRule(/:\|/, function() {
    return {
        type: "barline",
        subtype: "repeat_end",
        v: 1
    }
}).addRule(/\|:/, function() {
    return {
        type: "barline",
        subtype: "repeat_start",
        v: 0
    }
}).addRule(/::/, function() {
    return {
        type: "barline",
        subtype: "double_repeat",
        v: 1
    }
}).addRule(/\[([0-9]+)/, function (all, sectionNumber) {
    return {
        type: "varient_section",
        subtype: "start_section",
        data: sectionNumber,
        v: 2
    };
}).addRule(/\["([a-z A-Z0-9]+)"/, function (all, sectionName) {
    return {
        type: "varient_section",
        subtype: "start_section",
        data: sectionName,
        v: 2
    };
}).addRule(/\|([0-9]+)/, function (all, sectionNumber) {
    return {
        type: "varient_section",
        subtype: "start_section",
        data: sectionNumber,
        v: 2
    };
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
}).addRule(/\(([2-9])/, function(all, size) {
    return {
        type: "tuplet_start",
        data: parseInt(size)
    }
}).addRule(/\(/, function() {
    return {
        type: "slur_start"
    }
}).addRule(/\)/, function() {
    return {
        type: "slur_stop"
    }
}).addRule(/-/, function () {
    return {
        type: "tie"
    }
});

//////////////////
// DATA FIELDS  //
//////////////////

lexer.addRule(/T: *([\w ',?]+)\s*$/, function(match, title) {
    return {
        type: "data",
        subtype: "title",
        data: title
    }
});

lexer.addRule(/X: *([0-9]+)\s*$/, function(match, num) {
    return {
        type: "data",
        subtype: "number",
        data: num
    }
});

lexer.addRule(/R: *([\w ]+)\s*$/, function(match, rhythm) {
    return {
        type: "data",
        subtype: "rhythm",
        data: rhythm
    }
});

lexer.addRule(/S: *([\w \/:\.#]+)\s*$/, function(match, source) {
    return {
        type: "data",
        subtype: "source",
        data: source
    }
});

lexer.addRule(/Z: *([\w \/:\.#]+)\s*$/, function(match, source) {
    return {
        type: "data",
        subtype: "transcriber",
        data: source
    }
});

lexer.addRule(/M: *([0-9]+)\/([0-9]+)\s*$/, function(match, top, bottom) {
    return {
        type: "data",
        subtype: "timesig",
        data: {
            top: top,
            bottom: bottom
        }
    }
});

lexer.addRule(/L: *([0-9]+)\/([0-9])\s*$/, function(match, top, bottom) {
    return {
        type: "data",
        subtype: "notelength",
        data: parseInt(top) / parseInt(bottom)
    }
});

lexer.addRule(/K: *([A-G][#|b]?) ?([\w]*)\s*$/, function(match, note, mode) {
    return {
        type: "data",
        subtype: "key",
        data: {
            note: note,
            mode: mode
        }
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


export function ABCLexer(dispatcher, input, lineId) {
    lexer.setInput(input);
    var output = [];

    do {  
        var data = undefined;
        try {
            data = lexer.lex();
            if(data !== undefined)output.push(data);
        } catch(e) {
            
            var error = {
                line: lineId,
                message: e.message,
                severity: 1,
                char: e.char,
                type: "LEXERERROR"
            };

            console.log(error);

            dispatcher.fire("abc_error", error);

            break;
        }           
    } while(data != undefined);

    return output;
}