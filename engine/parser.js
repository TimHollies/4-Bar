'use strict';

var
    lexer = require('./lexer.js'),
    data_tables = require('./data_tables.js'),
    _ = require('lodash'),
    dispatcher = require('./dispatcher'),

    AbcNote = require("./types/AbcSymbol").AbcNote,
    AbcRest = require("./types/AbcSymbol").AbcRest,
    AbcSymbol = require("./types/AbcSymbol").AbcSymbol,
    AbcChord = require("./types/AbcChord").AbcChord;

function ParserException(message) {
    this.message = message;
    this.name = "ParserException";
}    

var ABCParser = function(dispatcher, transposeAmount) {

    //the typecache is to get the type of deleted rows without having to reparse
    var typecache = [];
    // var dicache = [];

    var drawableIndex = 0;
    var maxStartId = 0;

    var noteLengthModifier = 0.125;

    dispatcher.on("change_notelength", function(data) {
        noteLengthModifier = data;
    });

    var transpose = transposeAmount || 0;

    //parse a note
    function parseNote(lexer, parsed) {

        var newNote = new AbcNote();

        while (lexer[0] && lexer[0].subType === "chord_annotation") {
            newNote.chord = new AbcChord(lexer[0].data);
            lexer.shift();
        }

        while (lexer[0] && lexer[0].subType === "decoration") {
            newNote.decorations.push(lexer[0]);
            lexer.shift();
        }

        if (lexer[0].subType == "accidental") {
            newNote.accidental = lexer.shift().data;
        }

        if (!lexer[0] || lexer[0].subType !== "letter") {
            lexer.shift();
            return new ParserException("Missing note name");
        }

        if (lexer[0] && lexer[0].subType == "letter") {
            newNote.note = lexer.shift().data;

            newNote.pitch = data_tables.notes[newNote.note].pitch + transpose;
            newNote.octave = data_tables.notes[newNote.note].octave;
            newNote.pos = data_tables.notes[newNote.note].pos + transpose;

        }

        if (lexer[0] && lexer[0].subType == "pitch") {
            newNote.octave += lexer.shift().data;
        }

        if (lexer[0] && lexer[0].subType == "length") {
            newNote.noteLength = lexer.shift().data * (noteLengthModifier / 0.125);
        }

        newNote.beamDepth = Math.floor(Math.log2(newNote.noteLength)) - 1;
        newNote.weight = data_tables.symbol_width.note(newNote);

        if(parsed === undefined || newNote.weight === undefined) {
            console.log("DAMN");
        }

        parsed.weight += newNote.weight;
        parsed.symbols.push(newNote);

        return newNote;
    }

    //parse a rest
    function parseRest(lexer) {
        var newRest = new AbcRest();

        newRest.visible = lexer[0].subType === "visible";
        newRest.subType = lexer[0].data === "short" ? "beat_rest" : "bar_rest";

        lexer.shift();

        if (lexer[0] && lexer[0].subType == "length") {
            newRest.restLength = lexer.shift().data;
        }

        return newRest;
    }

    /**
     * Parses a group of notes
     * @param  {Array} The output array for the entire parse process
     * @param  {Array} The input array of lexed tokens
     * @param  {String} The name of the type of note group
     * @param  {String} The type of token that starts the note group
     * @param  {String} The type of token that ends the note group
     * @return {Boolean} Returns TRUE if the specified note group was found
     */
    function noteGroup(parsed, lexed, name, start, stop) {
        if (lexed[0].type === start) {
            lexed.shift();

            var groupNotes = [];

            while (lexed.length > 0 && lexed[0].type != stop) {
                if (lexed[0].type === "note") {
                    groupNotes.push(parseNote(lexed));
                    continue;
                } else {
                    /*throw new*/
                    groupNotes.push(new ParserException("Only notes are allowed in " + name + "s"));
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

        if (lexed[0].type === stop) {
            parsed.push(new ParserException("Closing " + name + " found before starting it"));
            lexed.shift();
            return true;
        }

        return false;
    };

    function parseSlur(parsed, lexed) {
        if (lexed[0].type === "slur_start") {
            lexed.shift();

            var groupNotes = [];

            while (lexed.length > 0 && lexed[0].type != "slur_stop") {
                if (lexed[0].type === "note") {
                    var parsedNote = parseNote(lexed, parsed);
                    groupNotes.push(parsedNote);
                     continue;
                } else {
                    /*throw new*/
                    groupNotes.push(new ParserException("Only notes are allowed in slurs"));
                    lexed.shift();
                    continue;
                }
            }

            parsed.symbols.push({
                type: "slur",
                type_class: "drawable",
                notes: groupNotes
            });

            lexed.shift();
            return true;
        }

        if (lexed[0].type === "slur_stop") {
            parsed.push(new ParserException("Closing slur found before starting it"));
            lexed.shift();
            return true;
        }

        return false;
    };

    var parseBarline = function (lexed, parsed) {

        var symbol = lexed.shift();

        var newBarline = new AbcSymbol('barline', 1);
        newBarline.subType = symbol.subtype;

        parsed.symbols.push(newBarline);
        parsed.weight += data_tables.symbol_width["barline"];

        return symbol.v;
    };

    /**
     * A recursive decent parser that combines lexed tokens into a meaningful data structure
     * @param  {Array} An array of lexed tokens
     * @return {Array} An array of parsed symbols
     */
    function parse(lexed, line) {

        var parsed = {
            symbols: [],
            weight: 0
        };

        var 
            currentVarientEnding = null,
            tupletBuffer = [],
            tupletCount = 0,
            tupletValue = 0;

        while (lexed.length > 0) {

            if (lexed[0].type === "data") {
                var lexedToken = lexed.shift();
                parsed.symbols.push({
                    type_class: "data",
                    type: lexedToken.subtype,
                    data: lexedToken.data
                });

                continue;
            }

            if (lexed[0].type === "beam") {
                lexed.shift();
                continue;
            }

            // if (lexed[0].type === "chord_annotation") {
            //     parsed.symbols.push({
            //         type_class: "drawable",
            //         type: "chord_annotation",
            //         text: lexed[0].data
            //     });
            //     lexed.shift();
            //     continue;
            // }
            if (lexed[0].type === "tuplet_start") {
                tupletCount = lexed[0].data;
                tupletValue = lexed[0].data;
                lexed.shift();
                continue;
            }

            if (lexed[0].type === "note") {
                parseNote(lexed, parsed);

                if(currentVarientEnding !== null && currentVarientEnding.start === null) {
                    currentVarientEnding.start = _.last(parsed.symbols);
                }

                if(tupletCount > 0) {
                    tupletBuffer.push(_.last(parsed.symbols));
                    tupletCount--;

                    if(tupletCount === 0) {

                        tupletBuffer.forEach(function(note) {
                            note.noteLength = (note.noteLength / tupletValue) * 2;
                            //note.weight = data_tables.symbol_width.note(note);
                        });

                        line.tuplets.push({
                            notes: tupletBuffer,
                            value: tupletValue
                        });
                        tupletBuffer = [];
                    }
                }

                continue;
            }

            if (lexed[0].type === "rest") {
                parsed.symbols.push(parseRest(lexed));
                parsed.weight += 1;
                continue;
            }

            if (lexed[0].type === "space") {
                parsed.symbols.push(new AbcSymbol("space", 0));
                lexed.shift();
                continue;
            }

            if(lexed[0].type === "varient_section") {
                var symbol = lexed.shift();

                currentVarientEnding = {
                    start: null,
                    name: symbol.data,
                    end: null
                };

                continue;
            }

            if (noteGroup(parsed, lexed, "chord", "chord_start", "chord_stop")) continue;
            if (parseSlur(parsed, lexed)) continue;
            if (noteGroup(parsed, lexed, "grace", "grace_start", "grace_stop")) continue;

            if (lexed[0].type === "barline") {

                if(parseBarline(lexed, parsed) === 1) {

                    if(line.firstEndingEnder === null) line.firstEndingEnder = _.last(parsed.symbols);

                    if(currentVarientEnding !== null) {
                        currentVarientEnding.end = _.last(parsed.symbols);
                        line.endings.push(currentVarientEnding);
                        currentVarientEnding = null;
                    }
                }

                
                continue;
            }

            if(lexed[0].type === "tie") {

                lexed.shift();

                //the last parsed symbol must be a note
                if(_.last(parsed.symbols).type === "note") {
                    
                    var tie = {
                        type: "tie",
                        start: _.last(parsed.symbols)
                    };

                    //eat the barline if required
                    if (lexed[0].type === "barline")parseBarline(lexed, parsed);

                    if (lexed[0].type === "note") {
                        parseNote(lexed, parsed);
                    } else {
                        //THROW ERROR
                        continue;
                    }

                    tie.end = _.last(parsed.symbols);

                    parsed.symbols.push(tie);
                } else {
                    //THROW ERROR
                    continue;
                }

                continue;
            }

            console.log(`PARSER ERROR: UNKNOWN ${lexed[0]}`);
            lexed.shift();
        }

        if(currentVarientEnding !== null) {
            line.endings.push(currentVarientEnding);
            line.endWithEndingBar = true;
        }

        return parsed;
    }

    function processAddedLine(line) {

       // try {

            //TODO: are these defaults defined in an odd place??
            if (line.raw.length === 0) {
                line.type = "drawable";
                // line.di = drawableIndex++;
                line.symbols = [];
                line.weight = 0;
            }

            var lexed = lexer(dispatcher, line.raw, line.id);

            if (lexed.length > 0) {

                var parseOutput = parse(lexed, line);

                line.symbols = parseOutput.symbols;
                line.weight = parseOutput.weight;

                if (!(parseOutput.symbols.length === 1 && parseOutput.symbols[0].type_class === "data")) {
                    line.type = "drawable";
                    // line.di = drawableIndex++;
                } else {
                    line.type = "data";
                }
            } else {
                line.type = typecache[line.id-1] === "drawable" ? "drawable" : "blank";
                line.symbols = [];
            }

        //typecache.set(line.id, line.type);
        typecache.splice(line.id, 0, line.type);
        //dicache.set(line.id, line.di);
        // dicache.splice(line.id, 0, line.di);


        // if(line.type === "drawable") {
        //     line.di = line.id - (_.findIndex(typecache, function(val) { return val === "drawable"; }));
        // }
    }

    var processDeletedLine = function(line) {
        line.type = typecache[line.id];
        // if (line.type === "drawable") {
            // line.di = dicache[line.id];
        // }

        typecache.splice(line.id, 1);
        // dicache.splice(line.id, 1);
    }

    return function (lineCollection) {

        if (lineCollection.startId < maxStartId) {      
            drawableIndex = 0;
            for(var i=0; i<lineCollection.startId; i++) {
                if (typecache[i] === "drawable") drawableIndex++;
            }
        } 

        if(lineCollection.startId > maxStartId) {
            for(var i = maxStartId; i<lineCollection.startId; i++) {
                if (typecache[i] === "drawable") drawableIndex++;
            }
        }

        maxStartId = lineCollection.startId + lineCollection.count;

        if (lineCollection.action === "ADD") {
            lineCollection.lines.forEach(processAddedLine);
        }

        if (lineCollection.action === "DEL") {
            _.forEachRight(lineCollection.lines, processDeletedLine);
        }

        return lineCollection;
    };

};

module.exports = ABCParser;