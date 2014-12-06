////////////
// Symbol //
////////////

AbcSymbol = function(type, weight) {
    this.type = type;
    this.weight = weight || 0;
}

AbcSymbol.prototype.subType = "";
AbcSymbol.prototype.weight = 0;
AbcSymbol.prototype.visible = true;
AbcSymbol.prototype.xp = 0;


AbcSymbol.prototype.getX = function(leadInWidth, lineWidth) {
    return (this.xp * (lineWidth - leadInWidth)) + leadInWidth;
}


AbcNote = function() {
    AbcSymbol.call(this, "note");
}

AbcNote.prototype = Object.create(AbcSymbol.prototype);
AbcNote.prototype.beamDepth = 0;
AbcNote.prototype.octave = 4;
AbcNote.prototype.pitch = 0;
AbcNote.prototype.pos = 0;
AbcNote.prototype.truepos = 0;
AbcNote.prototype.letter = "";
AbcNote.prototype.accidentals = "";
AbcNote.prototype.noteLength = 1;
AbcNote.prototype.beams = [];

AbcRest = function() {
    AbcSymbol.call(this, "rest", 1);
}

AbcRest.prototype.restLength = 1;

module.exports = {
    AbcNote: AbcNote,
    AbcSymbol: AbcSymbol
};