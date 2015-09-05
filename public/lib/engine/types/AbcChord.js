'use strict';

////////////
// Symbol //
////////////

import zaz from 'zazate.js';

let chordRegex = /^([A-G](?:b|#)?)(m|min|maj|dim|aug|\+|sus)?(2|4|7|9|13)?(\/[A-G](?:b|#)?)?$/i;

let transposeNote = function (note, a) {
	let transposedInt = zaz.notes.note_to_int(note.toUpperCase()) + a;
	let hashed = ((transposedInt % 12) + 12) % 12;
	return zaz.notes.int_to_note(hashed); 
}

export class AbcChord {
    constructor(text) {
        this.text = text;
    
        var regexTestResult = chordRegex.exec(text);
    
        if(regexTestResult === null) {
        	this.parsed = false;
        } else {
        	this.parsed = true;
    
        	this.note = regexTestResult[1];
        	this.type = regexTestResult[2];
        	this.number = regexTestResult[3];
        	this.base = regexTestResult[4];
        }
    }

    getText(transpose) {
    	if(!this.parsed || transpose === 0) return this.text;

    	var output = transposeNote(this.note, transpose);
    	if(this.type) output += this.type;
    	if(this.number) output += this.number;
    	if(this.base) output += "/" + transposeNote(this.base.substr(1), transpose);
   		return output; 	
    };
}