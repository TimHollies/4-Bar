'use strict';

var
    lexer = require('./lexer.js'),
    data_tables = require('./data_tables.js'),
    _ = require('vendor').lodash,
    enums = require('./types'),

    typecache = new Map(),
    dicache = new Map(),
    drawableIndex = 0,
    decorationstack = [];

function ParserException(message) {
    this.message = message;
    this.name = "ParserException";
}

function parseNote(lexer, parsed) {
    var newNote = {
        type: "note",
        type_class: "drawable",
        notelength: 1
    };

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
        newNote.pitch = data_tables.notes[newNote.note].pitch;
        newNote.octave = data_tables.notes[newNote.note].octave;
        newNote.pos = data_tables.notes[newNote.note].pos;
    }

    if (lexer[0] && lexer[0].subType == "pitch") {
        newNote.octave += lexer.shift().data;
    }

    if (lexer[0] && lexer[0].subType == "length") {
        newNote.notelength = lexer.shift().data;
    }

    newNote.beamDepth = Math.floor(Math.log2(newNote.notelength)) - 1;

    parsed.weight += data_tables.symbol_width.note(newNote);
    parsed.symbols.push(newNote);
}

function parseRest(lexer) {
    var newRest = {};

    newRest.type_class = lexer[0].subType === "visible" ? "drawable" : "hidden";
    newRest.type = lexer[0].data === "short" ? "beat_rest" : "bar_rest";

    lexer.shift();

    if (lexer[0] && lexer[0].subType == "length") {
        newRest.notelength = lexer.shift().data;
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
}

/**
 * A recursive decent parser that combines lexed tokens into a meaningful data structure
 * @param  {Array} An array of lexed tokens
 * @return {Array} An array of parsed symbols
 */
function parse(lexed) {

    var parsed = {
        symbols: [],
        weight: 0
    };

    while (lexed.length > 0) {
        if (lexed[0].type === "err") {
            /*throw new*/
            parsed.symbols.push(new ParserException("Unrecognised sequence: " + lexed[0].data));
            lexed.shift();
            continue;
        }

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

        if (lexed[0].type === "chord_annotation") {
            parsed.symbols.push({
                type_class: "drawable",
                type: "chord_annotation",
                text: lexed[0].data
            });
            lexed.shift();
            continue;
        }

        if (lexed[0].type === "note") {
            parseNote(lexed, parsed);
            continue;
        }

        if (lexed[0].type === "rest") {
            parsed.symbols.push(parseRest(lexed));
            parsed.weight += 1;
            continue;
        }

        if (lexed[0].type === "space") {
            parsed.symbols.push({
                type: "space",
                type_class: "hidden"
            });
            lexed.shift();
            continue;
        }

        if (noteGroup(parsed, lexed, "chord", "chord_start", "chord_stop")) continue;
        if (noteGroup(parsed, lexed, "slur", "slur_start", "slur_stop")) continue;
        if (noteGroup(parsed, lexed, "grace", "grace_start", "grace_stop")) continue;

        if (lexed[0].type === "barline") {
            var symbol = lexed.shift();
            parsed.symbols.push({
                type: "barline",
                type_class: "drawable",
                subtype: symbol.subtype
            });
            parsed.weight += 1;
            continue;
        }
    }

    return parsed;
}

function processLine(action, i, raw) {
    //console.log(action, i, raw);
    var data = {};

    try {
        if(raw.length === 0) {
            data.type_class = enums.line_types.drawable;
            data.di = drawableIndex++;
            data.parsed = [];
            data.weight = 0;
        }

        var lexed = lexer(raw);
        if (lexed.length > 0) {
            var parseOutput = parse(lexed);
            data.parsed = parseOutput.symbols;
            data.weight = parseOutput.weight;

            if (!(data.parsed.length === 1 && data.parsed[0].type_class === "data")) {
                data.type_class = enums.line_types.drawable;
                data.di = drawableIndex++;
            } else {
                data.type_class = enums.line_types.data;
            }
        } else {
            data.type_class = enums.line_types.drawable;
            data.parsed = [];
        }

    } catch (err) {
        console.log("ERR", err);
        data.error_details = err;
        data.error = true;
    }
    return data;
}

module.exports = function(line) {

    if(line.lineno === 0)drawableIndex = 0;

    if (line.action === "ADD") {
        for (var i = 0; i < line.lineLength; i++) {
            var data = processLine(line.action, i + line.lineno, line.split[i].raw);    

            if(data.error) {
                console.log("ERROR");
            }

            typecache.set(i + line.lineno, data.type_class);
            line.split[i].type_class = data.type_class;
            line.split[i].parsed = data.parsed;
            line.split[i].weight = data.weight;
            line.split[i].di = data.di;
            dicache.set(i + line.lineno, data.di);
        }
    }

    if (line.action === "DEL") {
        for (var i = 0; i < line.lineLength; i++) {
            line.split[i].type_class = typecache.get(i + line.lineno);
            if(typecache.get(i + line.lineno) === enums.line_types.drawable) {
                line.split[i].di = dicache.get(i + line.lineno);
            }
        }
    }

    if (line.action === "NONE") {
        for (var i = 0; i < line.lineLength; i++) {
            if(typecache.get(i + line.lineno) === enums.line_types.drawable)drawableIndex++;
        }
    }

    return line;
}