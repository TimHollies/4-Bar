'use strict';

var
    lexer = require('./lexer.js'),
    data_tables = require('./data_tables.js'),
    _ = require('vendor').lodash,
    enums = require('./types'),
    dispatcher = require('./dispatcher'),

    AbcNote = require("./types/AbcSymbol").AbcNote,
    AbcSymbol = require("./types/AbcSymbol").AbcSymbol,
    AbcChord = require("./types/AbcChord").AbcChord;

function ParserException(message) {
    this.message = message;
    this.name = "ParserException";
}    

var ABCParser = () => {

    var typecache = new Map();
    var dicache = new Map();
    var drawableIndex = 0;
    var decorationstack = [];

    var transpose = 0;

    dispatcher.on("transpose_change", function(data) {
        transpose = data;
    });


    //parse a note
    function parseNote(lexer, parsed) {

        var newNote = new AbcNote();

        while (lexer[0] && lexer[0].subType === "chord_annotation") {
            newNote.chord = new AbcChord(lexer[0].data);
            lexer.shift();
        }

        while (lexer[0] && lexer[0].subType === "decoration") {
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
            newNote.noteLength = lexer.shift().data;
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

    var parseBarline = (lexed, parsed) => {

        var symbol = lexed.shift();

        var newBarline = new AbcSymbol('barline', 1);
        newBarline.subType = symbol.subtype;

        parsed.symbols.push(newBarline);
        parsed.weight += 1;

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

        var currentVarientEnding = null;

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

            if (lexed[0].type === "note") {
                parseNote(lexed, parsed);

                if(currentVarientEnding !== null && currentVarientEnding.start === null) {
                    currentVarientEnding.start = _.last(parsed.symbols);
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

        console.log("PARSED", parsed);
        return parsed;
    }

    function processAddedLine(line) {

       // try {

            if (line.raw.length === 0) {
                line.type = "drawable";
                line.di = drawableIndex++;
                line.symbols = [];
                line.weight = 0;
            }

            var lexed = lexer(line.raw, line.id);

            if (lexed.length > 0) {

                var parseOutput = parse(lexed, line);

                line.symbols = parseOutput.symbols;
                line.weight = parseOutput.weight;

                if (!(parseOutput.symbols.length === 1 && parseOutput.symbols[0].type_class === "data")) {
                    line.type = "drawable";
                    line.di = drawableIndex++;
                } else {
                    line.type = "data";
                }
            } else {
                line.type = "drawable";
                line.parsed = [];
            }

        typecache.set(line.id, line.type);
        dicache.set(line.id, line.di);
    }

    var processDeletedLine = function(line) {
        line.type = typecache.get(line.id);
        if (typecache.get(line.id) === "drawable") {
            line.di = dicache.get(line.id);
        }
    }

    var processUnmodifiedLine = function(line) {
        if (typecache.get(line.id) === "drawable")
            drawableIndex++;
    }

    return (lineCollection) => {
        if (lineCollection.startId === 0) drawableIndex = 0;

        if (lineCollection.action === "ADD") {
            lineCollection.lines.forEach(processAddedLine);
        }

        if (lineCollection.action === "DEL") {
            lineCollection.lines.forEach(processDeletedLine);
        }

        if (lineCollection.action === "NONE") {
            lineCollection.lines.forEach(processUnmodifiedLine);
        }

        return lineCollection;
    };

};

module.exports = ABCParser;