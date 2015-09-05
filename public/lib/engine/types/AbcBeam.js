var
    POS_SWITCH = 6;

export class AbcBeam {
    
    constructor(notes) {
    
    	var hNote, lNote, hNoteIndex, lNoteIndex;
    
        var avgPos = this.avgPos = notes.reduce(function(a, b, i) { 
    
        	if(lNote === undefined || lNote.truepos > b.truepos) {
                lNote = b;
                lNoteIndex = i;
            }
    
        	if(hNote === undefined || hNote.truepos < b.truepos) {
                hNote = b;
                hNoteIndex = i;
            }
    
        	return a + b.truepos; 
    
        }, 0) / notes.length;
    
        var downBeam = this.downBeam = avgPos > POS_SWITCH;
    
        notes.forEach(function(note) {
        	note.forceStem = downBeam ? 1 : -1;
        });
    
        var baseNote = this.baseNote = this.downBeam ? lNote : hNote;
        this.baseNoteIndex = this.downBeam ? lNoteIndex : hNoteIndex;
    
        var x, y;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var count = 0;
    
        for (var v = 0; v < notes.length; v++) {
            x = notes[v].xp;//notes[v].truepos;
            y = notes[v].truepos;
            sum_x += x;
            sum_y += y;
            sum_xx += x*x;
            sum_xy += x*y;
            count++;
        }
    
        var m = ((count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x))*2;
    
        notes.forEach(function(note) {
            var xpDist = note.xp - baseNote.xp;
            var heightDiff = Math.abs(note.y - baseNote.y);
            note.beamOffsetFactor = (xpDist * -m) + baseNote.y + (downBeam ? 28 : -28);
            note.beamed = true;
        });
    
        this.gradient = m;
        this.depth = 0;
        this.notes = notes;
        this.count = notes.length;
                
        this.subType = "";
        this.weight = 0;
    }
}