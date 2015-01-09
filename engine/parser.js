'use strict';

var
    lexer = require('./lexer.js'),
    data_tables = require('./data_tables.js'),
    _ = require('vendor').lodash,
    enums = require('./types'),

    AbcNote = require("./types/AbcSymbol").AbcNote,
    AbcSymbol = require("./types/AbcSymbol").AbcSymbol,

    typecache = new Map(),
    dicache = new Map(),
    drawableIndex = 0,
    decorationstack = [];

function ParserException(message) {
    this.message = message;
    this.name = "ParserException";
}

function parseNote(lexer, parsed) {
    var newNote = new AbcNote();

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
        newNote.noteLength = lexer.shift().data;
    }

    newNote.beamDepth = Math.floor(Math.log2(newNote.noteLength)) - 1;
    newNote.weight = data_tables.symbol_width.note(newNote);

    parsed.weight += newNote.weight;
    parsed.symbols.push(newNote);
}

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
            parsed.symbols.push(new AbcSymbol("space", 0));
            lexed.shift();
            continue;
        }

        if (noteGroup(parsed, lexed, "chord", "chord_start", "chord_stop")) continue;
        if (noteGroup(parsed, lexed, "slur", "slur_start", "slur_stop")) continue;
        if (noteGroup(parsed, lexed, "grace", "grace_start", "grace_stop")) continue;

        if (lexed[0].type === "barline") {
            var symbol = lexed.shift();

            var newBarline = new AbcSymbol('barline', 1);
            newBarline.subType = symbol.subtype;

            parsed.symbols.push(newBarline);
            parsed.weight += 1;

            continue;
        }
    }

    return parsed;
}

function processAddedLine(line, id) {

    try {

        if (line.raw.length === 0) {
            line.type = "drawable";
            line.di = drawableIndex++;
            line.symbols = [];
            line.weight = 0;
        }

        var lexed = lexer(line.raw);

        if (lexed.length > 0) {

            var parseOutput = parse(lexed);

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

    } catch (err) {
        console.log("ERR", err);
        line.error = true;
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

module.exports = function(lineCollection) {

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
}