/////////////
// ABCLine //
/////////////

export class AbcLine {
    constructor(raw, id) {
        this.raw = raw;
        this.id = id;
        this.endings = [];
        this.tuplets = [];
        this.firstEndingEnder = null;
        
        this.type = "hidden";
        this.di = -1;
        this.parsed = [];
        this.weight = 0;
        this.error = false;
        this.changed = false;
        this.endWithEndingBar = false;
    }
}


export class LineCollection {
    constructor(id, raw, action) {
            
        var split = raw.split(/\r\n|\r|\n/);
    
        if (split[split.length - 1] === '') {
            split = split.slice(0, split.length - 1);
        }
    
        this.lines = split.map(function(line, i) {
            return new AbcLine(line, i + id);
        });
    
        this.count = this.lines.length;
    
        this.action = action;
    
        this.startId = id;
    }
}