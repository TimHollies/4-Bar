define([
 'scripts/jslex/jslex/jslex',
'engine/data_tables',
'lodash'
], function(jslex, data_tables, _) {
    'use strict';
    
    var simpleType = function(name) {
        return { type: name };
    }
    
    var charCountInString = function(string, character) {
        return string.split(character).length - 1;
    }
    
    var lexer = jslex({
    
        "start": {
            "(_|\\^)?([A-Ga-g])([',]*)([0-9]+)?/?([0-9]+)?": function(accidental, note, pitchModifier, notelength, notedenom) {
                return {
                    type: "note",
                    note: note,
                    notelength: notelength ? notedenom && notedenom.length > 0 ? parseFloat(notelength)/parseFloat(notedenom) : parseInt(notelength) : 1,
                    pitch: data_tables["notes"][note].pitch,
                    octave: data_tables["notes"][note].octave + charCountInString(pitchModifier, "'") - charCountInString(pitchModifier, ","),
                    accidental: accidental,
                    text: this.text,
                    length: this.length
                };
            }, 
            "\\|": function() { return simpleType("barline"); },
            "\\|\\|": function() { return simpleType("doublebarline"); },
            ":\\|": function() { return simpleType("endrepeat"); },
            "\\|:": function() { return simpleType("startrepeat"); },
            "T: *([a-zA-z 0-9]+)\n?": function(title) {
                return { "type": "header", "title": title };
            },
            "X: *([0-9]+)\n?": function(number) {
                return { "type": "header", "number": number };
            },
            " ": function() { return simpleType("space"); },
            "\n": function() { return simpleType("newline"); },
            ".": function() {
            	throw "invalid input";
            }
        }
        
    });
    
    return lexer;
});