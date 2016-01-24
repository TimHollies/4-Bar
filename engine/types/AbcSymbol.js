////////////
// Symbol //
////////////

var AbcSymbol = function(type) {
    this.type = type;
}

AbcSymbol.prototype.subType = "";
AbcSymbol.prototype.visible = true;
AbcSymbol.prototype.xp = 0;
AbcSymbol.prototype.align = 0;

AbcSymbol.prototype.fixedWidth = 0;
AbcSymbol.prototype.springConstant = 0;


AbcSymbol.prototype.getX = function(leadInWidth, lineWidth) {
    return (this.xp * (lineWidth - leadInWidth)) + leadInWidth;
}


var AbcNote = function() {
    AbcSymbol.call(this, "note");
    this.decorations = [];
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
AbcNote.prototype.forceStem = 0;
AbcNote.prototype.beamOffsetFactor = 0;
AbcNote.prototype.y = null;
AbcNote.prototype.beamed = false;
AbcNote.prototype.chord = "";

var AbcRest = function() {
    AbcSymbol.call(this, "rest", 1);
}

AbcRest.prototype = Object.create(AbcSymbol.prototype);
AbcRest.prototype.restLength = 1;

module.exports = {
    AbcNote: AbcNote,
    AbcSymbol: AbcSymbol,
    AbcRest: AbcRest
};