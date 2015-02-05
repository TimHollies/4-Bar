////////////
// Symbol //
////////////

var chordRegex = /^([A-G](?:b|#)?)(m|min|maj|dim|aug|\+|sus)?(2|4|7|9|13)?(\/[A-G](?:b|#)?)?$/i;

var zaz = require('vendor').zazate;

window.zaz = zaz;

var transposeNote = (note, a) => {
	var transposedInt = zaz.notes.note_to_int(note.toUpperCase()) + a;
	var hashed = ((transposedInt % 12) + 12) % 12;
	return zaz.notes.int_to_note(hashed); 
}

var AbcChord = function(text) {
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

    this.getText = (transpose) => {
    	if(!this.parsed || transpose === 0) return this.text;

    	var output = transposeNote(this.note, transpose);
    	if(this.type) output += this.type;
    	if(this.number) output += this.number;
    	if(this.base) output += "/" + transposeNote(this.base.substr(1), transpose);
   		return output; 	
    };
}

module.exports = {
    AbcChord: AbcChord,
};