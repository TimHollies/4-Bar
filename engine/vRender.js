var s = require('virtual-dom/virtual-hyperscript/svg');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');
var draw = require('./rendering/virtual_stave_symbols');

function SVG() {
    this.root = s("svg", {
        viewBox: "0 0 1000 800",
        width: "75%",
        height: "100%"
    });
}

SVG.prototype.render = function(node) {
    node.appendChild(createElement(h("div", [this.root])));
};

var settings;

var renderLine = function(line, lineIndex) {

    var lineGroup = s("g", {
        transform: ["translate(100,", 32 + lineIndex * 72, ")"].join('')
    });

    var leadInGroup = s("g");
    lineGroup.children.push(draw.stave(), leadInGroup);

    var clef = draw.treble_clef();
    var keySig = draw.keysig(settings.key, clef.width);

    leadInGroup.children.push(clef.node, keySig.node);

    if (lineIndex === 0) {
        leadInGroup.children.push(draw.timesig(settings.measure.top, settings.measure.bottom, clef.width + keySig.width));
    }

    var symbolsGroup = s("g", { transform: "translate(" + (clef.width + keySig.width) + ",0)"});

    var noteAreaWidth = 800 - (clef.width + keySig.width);

    for (var i = 0; i < line.symbols.length; i++) {
        /*symbolsGroup.children.push(s("rect", {
            width: 16,
            height: 16,
            x: line.symbols[i].xp * noteAreaWidth,
            fill: "red"
        }));*/
        symbolsGroup.children.push(draw[line.symbols[i].type](line.symbols[i], line.symbols[i].xp * noteAreaWidth));
    }

    lineGroup.children.push(symbolsGroup);

    return lineGroup;
}

var renderTune = function(tuneData) {

    settings = tuneData.tuneSettings;
    console.log("SETTINGS", settings);
    settings.key = {
        note: "D",
        mode: "Minor"
    };

    var doc = new SVG();

    tuneData.scoreLines.map(renderLine).forEach(function(renderedLine) {
        doc.root.children.push(renderedLine);
    });

    var topDiv = h("div.render-div", [
        h("div.tune-header", [h("h2", [settings.title])]),
        h("div.tune-body", [doc.root])
    ]);

    document.getElementById("canvas").appendChild(createElement(topDiv));
};

module.exports = renderTune;