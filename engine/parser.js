'use strict';

var
    lexer = require('./lexer.js'),
    data_tables = require('./data_tables.js'),
    _ = require('vendor').lodash,
    enums = require('./types'),

    cache = {},
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

    parsed.weight += newNote.notelength;
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

        if (lexed[0].type_class === "data") {
            lexed.shift();
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
            lexed.shift();
            parsed.symbols.push({
                type: "barline",
                type_class: "drawable"
            });
            parsed.weight += 1;
            continue;
        }
    }

    return parsed;
}

module.exports = function(line) {

    if (line.action !== enums.line_actions.move) {
        try {
            var lexed = lexer(line.raw);

            if (lexed.length > 0) {

                var parseOutput = parse(lexed)
                line.parsed = parseOutput.symbols;
                line.weight = parseOutput.weight;

                if (!(lexed.length === 1 && lexer[0].type_class === "data")) {
                    line.type_class = enums.line_types.drawable;
                } else {
                    line.type_class = enums.line_types.data;
                }
            } else {
                line.parsed = [];
                line.type_class = enums.line_types.hidden;
            }
        } catch(err) {
            console.log("ERR", err);
            line.type_class = enums.line_types.hidden;
            line.error_details = err;
            line.error = true;
        }

    }

    return line;
}