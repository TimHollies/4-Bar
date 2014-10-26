define([
    'lodash',
    'svgjs',
    'scripts/randomColor/randomColor'
], function(_, svg, randomColor) {
        
    'use strict';
    
    var 
        draw,  
        scoreLines,
        data = {},
        lineHeight = 25; 
    
    var arrangeGroups = function() {
        var offset = 0;
        
        if(data.title != null)offset = 4;
        
        for(var i=0; i<scoreLines.length; i++) {
            if(scoreLines[i] === undefined)continue;
            
            if(scoreLines[i] != 0) {
                scoreLines[i].move(0, lineHeight * offset);
                offset += 1;
            }
        }
    }
    
    var symbolHandler = {
        "drawable": function(a) {
            
            if(scoreLines[a.i] === undefined) {
                scoreLines[a.i] = draw.group();
            } else {
                scoreLines.splice(a.i, 0, draw.group());
            }
            
            for(var j = 0, totalOffset = 0; j < a.parsed.length; j++)
                totalOffset += drawingFunctions[a.parsed[j].type](scoreLines[a.i], a, j, totalOffset);
                
        },
        "data": function(a)  {
            
            scoreLines[a.i] = 0;
            
            if(informationFieldFunctions[a.parsed[0].type] === undefined) {
                console.log("NOT YET IMPLEMENTED");
                return;
            }
            
            informationFieldFunctions[a.parsed[0].type](a);
        }
    };
    
    var deleteSymbolHandler = {
        "drawable": function(a) {
            if(scoreLines[a.i])scoreLines[a.i].remove();
            scoreLines[a.i] = undefined;             
        },
        "data": function(a) {
            
            scoreLines[a.i] = undefined; 
            
            if(informationFieldFunctions[a.parsed[0].type] === undefined) {
                console.log("NOT YET IMPLEMENTED");
                return;
            }
            
            delInformationFieldFunctions[a.parsed[0].type](a);
        }
    };
    
    var actionHandler = {
        "add": function(a) {
            symbolHandler[a.type_class](a);
            console.log("ADD", scoreLines);
        },
        "del": function(a) {
            deleteSymbolHandler[a.type_class](a);
            console.log("DEL", scoreLines);
        },
        "move": function(a) {
            if(a.i<a.j) {        
                scoreLines[a.i] = scoreLines[a.j];
                scoreLines[a.j] = undefined;
            }
            console.log("MOV", scoreLines);
        },
        "endofinput": _.noop
    }
    
    var drawingFunctions = {
        "note": function(line, a, j, totalOffset) {
            line.rect(a.parsed[j].notelength*20,20).attr({ fill: a.error ? '#F00' : randomColor({luminosity: 'dark'}) }).move(totalOffset,0);
            return a.parsed[j].notelength*20 + 5;            
        },
        "barline": function(line, a, j, totalOffset) {
            line.circle(20).attr({ fill: "#CCC" }).move(totalOffset,0);
            return 25;
        },
        "space": function() {
            return 25;
        }
    };
    
    var informationFieldFunctions = {
        "title" : function(a) {            
            if(data.title) data.title.remove();
            data.title = draw.text(a.parsed[0].data).font({
                        family:   'Georgia'
                        , size:     32
                        , anchor:   'middle'
                        , leading:  '1.5em'
                        }).move(400, 0);
        },
        "rhythm": function(a) {
            if(data.rhythm) data.rhythm.remove();
            data.rhythm = draw.text(a.parsed[0].data).font({
                        family:   'Georgia'
                        , size:     16
                        , anchor:   'middle'
                        , leading:  '1.5em'
                        }).move(20, 60);
        }
    }
    
     var delInformationFieldFunctions = {
        "title" : function(a) {            
            data.title.remove();
            data.title = null; 
        },
        "rhythm": function(a) {
            data.rhythm.remove();
            data.rhythm = null;
        }
    }
    
    //exported functions
    var exportFunctions = {};
    
    exportFunctions.initialize = function() {
        draw = svg('canvas');
        scoreLines = [];
    };   
    
    exportFunctions.onNext = function(a) {
        actionHandler[a.action](a);
        arrangeGroups();
        scoreLines = scoreLines.slice(0, a.newLength);
        return a;
    };    
    
    return exportFunctions;
});