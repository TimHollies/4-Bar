/////////////
// ABCLine //
/////////////

AbcLine = function(raw, id) {
    this.raw = raw;
    this.id = id;
    this.endings = [];
    this.firstEndingEnder = null;
}

AbcLine.prototype.type = "hidden";
AbcLine.prototype.di = -1;
AbcLine.prototype.parsed = [];
AbcLine.prototype.weight = 0;
AbcLine.prototype.error = false;
AbcLine.prototype.changed = false;
AbcLine.prototype.endWithEndingBar = false;

///////////////////
//LineCollection //
///////////////////

LineCollection = function(id, raw, action) {
    
    var split = raw.split('\n');

    if (split[split.length - 1] === '') {
        split = split.slice(0, split.length - 1);
    }

    this.lines = split.map(function(line, i) {
        return new AbcLine(line, i + id);
    });

    this.count = this.lines.length;

    this.action = action;

    this.startId = id;
};

module.exports = LineCollection;