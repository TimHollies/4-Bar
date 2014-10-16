define([
 'scripts/jslex/jslex/jslex',
'engine/data_tables',
'lodash'
], function(jslex, data_tables, _) {
    'use strict';
    
    var simpleType = function(name) {
        return { type: name, type_class: "drawable" };
    }
    
    var charCountInString = function(string, character) {
        return string.split(character).length - 1;
    }
    
    var lexer = jslex({
    
        "start": {
            "(_|\\^)?([A-Ga-g])([',]*)([0-9]+)?/?([0-9]+)?": function(accidental, note, pitchModifier, notelength, notedenom) {
                return {
                    type: "note",
                    type_class: "drawable",
                    note: note,
                    notelength: notelength ? notedenom && notedenom.length > 0 ? parseFloat(notelength)/parseFloat(notedenom) : parseInt(notelength) : 1,
                    pitch: data_tables["notes"][note].pitch,
                    octave: data_tables["notes"][note].octave + charCountInString(pitchModifier, "'") - charCountInString(pitchModifier, ","),
                    accidental: accidental,
                    text: this.text
                };
            }, 
            "\\|": function() { return simpleType("barline"); },
            "\\|\\|": function() { return simpleType("doublebarline"); },
            ":\\|": function() { return simpleType("endrepeat"); },
            "\\|:": function() { return simpleType("startrepeat"); },
            "T: *([^\n]*)\n?": function(title) {
                return { type_class: "data", "type": "title", "title": title };
            },
            "X: *([0-9]+)\n?": function(number) {
                return { type_class: "data", "type": "number", "number": number };
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