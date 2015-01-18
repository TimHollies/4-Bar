var s = require('virtual-dom/virtual-hyperscript/svg'),
    h = require('virtual-dom/h'),
    createElement = require('virtual-dom/create-element'),
    draw = require('./rendering/virtual_stave_symbols.js'),
    diff = require('virtual-dom/diff'),
    patch = require('virtual-dom/patch'),

    previousNodeTree,
    settings,
    nextLineStartsWithEnding;

function SVG() {
    this.root = s("svg", {
        viewBox: "0 0 1000 800",
        width: "75%",
        height: "100%"
    }); 
} 

SVG.prototype.render = (node) => {
    node.appendChild(createElement(h("div", [this.root])));
};

var init = () => {
    previousNodeTree = undefined;
    settings = undefined;
    nextLineStartsWithEnding = false;
};

var renderLine = (line, lineIndex) => {

    var lineGroup = s("g", {
        transform: `translate(100,${32 + lineIndex * 96})`
    });

    var leadInGroup = s("g");
    lineGroup.children.push(draw.stave(), leadInGroup);

    var clef = draw.treble_clef();
    var keySig = draw.keysig(settings.key, clef.width);

    leadInGroup.children.push(clef.node, keySig.node);

    var leadInWidth = clef.width + keySig.width;

    if (lineIndex === 0) {
        var timeSig = draw.timesig(settings.measure.top, settings.measure.bottom, clef.width + keySig.width);
        leadInGroup.children.push(timeSig.node);
        leadInWidth += timeSig.width;
    }

    var symbolsGroup = s("g", { transform: `translate(${leadInWidth},0)`});
    

    var 
        noteAreaWidth = 800 - leadInWidth;

    for (var i = 0; i < line.symbols.length; i++) {
        if(line.symbols[i].type === "tie")console.log("WAY");
        symbolsGroup.children.push(draw[line.symbols[i].type](line.symbols[i], line.symbols[i].xp * noteAreaWidth, noteAreaWidth));
    }

    for(var i = 0; i < line.endings.length; i++) {
        symbolsGroup.children.push(draw.varientEndings(line.endings[i], noteAreaWidth, false));
    }

    if(nextLineStartsWithEnding) {
        symbolsGroup.children.push(draw.varientEndings({
            name: "",
            start: {
                xp: 0
            },
            end: line.firstEndingEnder
        }, noteAreaWidth, true));
    }

    nextLineStartsWithEnding = line.endWithEndingBar;

    lineGroup.children.push(symbolsGroup);

    return lineGroup;
}

var renderTune = (tuneData) => {

    settings = tuneData.tuneSettings;
    settings.rhythm = "Reel";

    var 
        doc = new SVG(),
        nextLineStartsWithEnding = false;

    tuneData.scoreLines.map(renderLine).forEach(function(renderedLine) {
        doc.root.children.push(renderedLine);
    });

    var topDiv = h("div.render-div", [
        h("div.tune-header", [
            h("h2", [settings.title]),
            h("p", [settings.rhythm])
        ]),
        h("div.tune-body", [doc.root])
    ]);

    if(previousNodeTree === undefined) {
        document.getElementById("canvas").innerHTML = '';
        document.getElementById("canvas").appendChild(createElement(topDiv));
    } else {
        document.getElementById("canvas").innerHTML = '';
        document.getElementById("canvas").appendChild(createElement(topDiv));
        //var patchData = diff(previousNodeTree, topDiv);
        //patch(document.getElementById("canvas").firstChild, patchData);
        
     }

    previousNodeTree = topDiv;    
};

module.exports = {
    render: renderTune,
    init: init
};