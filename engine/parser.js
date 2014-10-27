'use strict';  

var
 lexer = require('./lexer.js'),
 data_tables = require('./data_tables.js'),
 _ = require('lodash');
          
    
    var cache = {};
    var drawableIndex = 0;
    
    function ParserException(message) {
        this.message = message;
        this.name = "ParserException";
    }
    
    function lex(string) {
        if(cache[string] !== undefined)return cache[string];
        var lexed = lexer.collect(string);
        cache[string] = lexed;
        return lexed;
    }
    
    var decorationstack = [];
    
    function parseNote(lexer) {
        var newNote = {
            type: "note",
            type_class: "drawable"
        };
        
        while(lexer[0] && lexer[0].subType === "decoration") {
            lexer.shift();
        }
        
        if(lexer[0].subType == "accidental") {
            newNote.accidental = lexer.shift().data;
        }
        
        if(!lexer[0] || lexer[0].subType !== "letter"){
            lexer.shift();
            return new ParserException("Missing note name");
        }
        
        if(lexer[0] && lexer[0].subType == "letter") {
            newNote.note = lexer.shift().data;
        }
        
        if(lexer[0] && lexer[0].subType == "pitch") {
            newNote.octave = lexer.shift().data;
        }
        
        if(lexer[0] && lexer[0].subType == "length") {
            newNote.notelength = lexer.shift().data;
        }
        
        return newNote;
    }
    
    function parseRest(lexer) {
        var newRest = {};
        
        newRest.type_class = lexer[0].subType === "visible" ? "drawable" : "hidden";
        newRest.type = lexer[0].data === "short" ? "beat_rest" : "bar_rest";
        
        lexer.shift();
        
        if(lexer[0] && lexer[0].subType == "length") {
            newRest.notelength = lexer.shift().data;
        }
        
        return newRest;
    }
    
    function noteGroup(parsed, lexed, name, start, stop) {
        if(lexed[0].type === start) {
            lexed.shift();
                        
            var groupNotes = [];
                        
            while(lexed.length > 0 && lexed[0].type != stop) {
                if(lexed[0].type === "note") {
                    groupNotes.push(parseNote(lexed));
                    continue;
                } else {
                    /*throw new*/ groupNotes.push(new ParserException("Only notes are allowed in " + name + "s"));
                    lexed.shift();
                    continue;
                }
            }
                        
            parsed.push({
                type: name,
                type_class: "drawable",
                notes: groupNotes
            });
                        
            lexed.shift();
            return true;
        }
        
        if(lexed[0].type === stop) {
            parsed.push(new ParserException("Closing " + name + " found before starting it"));
            lexed.shift();
            return true;
        }
        
        return false;
    }
    
    function parse(lexed) {
        
        var parsed = [];
        
        while(lexed.length > 0) {
            if(lexed[0].type === "err") {
                /*throw new*/parsed.push(new ParserException("Unrecognised sequence: " + lexed[0].data));
                lexed.shift();
                continue;
            }
                    
            if(lexed[0].type_class === "data") {
                lexed.shift();
                continue;
            }
            
            if(lexed[0].type === "beam") {
                lexed.shift();
                continue;
            }
            
            if(lexed[0].type === "chord_annotation") {
                parsed.push({
                    type_class: "drawable",
                    type: "chord_annotation",
                    text: lexed[0].data
                });
                lexed.shift();
                continue;
            }            
            
            if(lexed[0].type === "note") {
                parsed.push(parseNote(lexed));
                continue;
            }
            
            if(lexed[0].type === "rest") {
                parsed.push(parseRest(lexed));
                continue;
            }
            
            if(lexed[0].type === "space") {
                parsed.push({
                    type: "space",
                    type_class: "hidden"
                });
                lexed.shift();
                continue;
            }
                    
            if(noteGroup(parsed, lexed, "chord", "chord_start", "chord_stop"))continue;
            if(noteGroup(parsed, lexed, "slur", "slur_start", "slur_stop"))continue;
            if(noteGroup(parsed, lexed, "grace", "grace_start", "grace_stop"))continue;                    
               
            if(lexed[0].type === "barline") {
                lexed.shift();
                parsed.push({
                    type: "barline",
                    type_class: "drawable"                                    
                });
                continue;
            }
        }
        
        return parsed;
    }
    
    module.exports = function(line) {        
        
        if(line.action !== "move") {           
                
            var lexed = lex(line.raw);
            
            console.log("DEBUG-LEXED:", lexed);
            
            if(lexed.length > 0) {    
                line.parsed = parse(lexed); 
            }
        }
           
        console.log("DEBUG-PARSED:", line.parsed);
        return line;       
    } 