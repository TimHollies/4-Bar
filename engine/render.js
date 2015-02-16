'use strict';

var s = require('virtual-dom/virtual-hyperscript/svg'),
    h = require('virtual-dom/h'),
    createElement = require('virtual-dom/create-element'),
    draw = require('./rendering/stave_symbols.js'),
    diff = require('virtual-dom/diff'),
    patch = require('virtual-dom/patch');

var ABCRenderer = function () {

    var
        previousNodeTree = null,
        settings = null,
        nextLineStartsWithEnding = false;

    var renderLine = function (line, lineIndex) {

        var lineGroup = s("g", {
            transform: `translate(100,${32 + lineIndex * 96})`
        });

        var leadInGroup = s("g");
        lineGroup.children.push(draw.stave(), leadInGroup);

        var clef = draw.treble_clef();
        var keySig = draw.keysig(settings.key, clef.width, line.id);

        if(keySig === false) return;

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

        for (let i = 0; i < line.symbols.length; i++) {
            symbolsGroup.children.push(draw[line.symbols[i].type](line.symbols[i], line.symbols[i].xp * noteAreaWidth, noteAreaWidth));
        }

        for(let i = 0; i < line.endings.length; i++) {
            symbolsGroup.children.push(draw.varientEndings(line.endings[i], noteAreaWidth, false));
        }

        for(let i = 0; i < line.tuplets.length; i++) {
            symbolsGroup.children.push(draw.tuplets(line.tuplets[i], noteAreaWidth));
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

    return function (tuneData) {

        settings = tuneData.tuneSettings;

        var 
            doc = s("svg", {
                viewBox: "0 0 1000 800",
                width: "100%",
                //height: "100%"
            }),
            nextLineStartsWithEnding = false;

        tuneData.scoreLines.map(renderLine).forEach(function(renderedLine) {
            doc.children.push(renderedLine);
        });

        var topDiv = h("div.render-div", [
            h("div.tune-header", [
                h("h2", [settings.title]),
                h("p.abc-tune-rhythm", [settings.rhythm])
            ]),
            h("div.tune-body", [doc])
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
};



module.exports = ABCRenderer;