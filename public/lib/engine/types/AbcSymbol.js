////////////
// Symbol //
////////////

export class AbcSymbol {
    constructor(type) {
        this.type = type;
                
        this.subType = "";
        this.visible = true;
        this.xp = 0;
        this.align = 0;
        
        this.fixedWidth = 0;
        this.springConstant = 0;
    }   
    
    getX(leadInWidth, lineWidth) {
        return (this.xp * (lineWidth - leadInWidth)) + leadInWidth;
    }
}


export class AbcNote extends AbcSymbol {
    constructor() {
        super("note");
        this.decorations = [];
        
        this.beamDepth = 0;
        this.octave = 4;
        this.pitch = 0;
        this.pos = 0;
        this.truepos = 0;
        this.letter = "";
        this.accidentals = "";
        this.noteLength = 1;
        this.beams = [];
        this.forceStem = 0;
        this.beamOffsetFactor = 0;
        this.y = null;
        this.beamed = false;
        this.chord = "";
    }
}

export class AbcRest extends AbcSymbol {
    constructor() {
        super("rest");
        this.restLength = 1;
    }
}