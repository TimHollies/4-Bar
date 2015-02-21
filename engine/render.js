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
    nextLineStartsWithEnding = false,
    currentRenderNoteId = 0;

    var renderLine = function (line, drawnLineIndex, lineIndex) {        

        var lineGroup = s(`g#line-${lineIndex}`, {
            transform: `translate(100,${32 + drawnLineIndex * 96})`,
            class: "svgTuneLine"
        });

        var leadInGroup = s("g");
        lineGroup.children.push(draw.stave(), leadInGroup);

        var clef = draw.treble_clef();
        var keySig = draw.keysig(settings.key, clef.width, line.id);

        if(keySig === false) return;

        leadInGroup.children.push(clef.node, keySig.node);

        var leadInWidth = clef.width + keySig.width;

        if (drawnLineIndex === 0) {
            var timeSig = draw.timesig(settings.measure.top, settings.measure.bottom, clef.width + keySig.width);
            leadInGroup.children.push(timeSig.node);
            leadInWidth += timeSig.width;
        }

        var symbolsGroup = s("g", { transform: `translate(${leadInWidth},0)`});
        

        var 
        noteAreaWidth = 800 - leadInWidth;

        /////////////////NEW///////////////////
        var springLength = noteAreaWidth - line.totalFixedWidth;
        console.log(springLength);
        var springMod = springLength / line.totalSpringConstant;
        console.log(springMod); 


        var xPos = 0;
        //////////////////////////////////////

        for (let i = 0; i < line.symbols.length; i++) {
            line.symbols[i].renderedXPos = xPos;
            if(line.symbols[i].type === "note") {
                line.symbols[i].renderNoteId = currentRenderNoteId++;
            }   
            symbolsGroup.children.push(draw[line.symbols[i].type](line.symbols[i], xPos/*line.symbols[i].xp * noteAreaWidth*/, noteAreaWidth));
            xPos += (line.symbols[i].fixedWidth + springMod * line.symbols[i].springConstant);
        }

        console.log(xPos, noteAreaWidth);

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
        currentRenderNoteId = 0;

        var 
        doc = s("svg#tuneSVGCanvas", {
            viewBox: "0 0 1000 800",
            width: "100%",
                //height: "100%"
            }),
        nextLineStartsWithEnding = false;

        var drawnLines = 0;
        tuneData.parsedLines.forEach(function(line, i) {
            if(line.type === "drawable") doc.children.push(renderLine(line, drawnLines++, i));            
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

        var svgs = document.getElementById("tuneSVGCanvas");
        var canvasElement = document.getElementById("canvas");

        var scrollDist = canvasElement.scrollTop;
        svgs.viewBox.baseVal.height = svgs.getBBox().height + 100;
        canvasElement.scrollTop = scrollDist;



        previousNodeTree = topDiv;    
    };
};



module.exports = ABCRenderer;