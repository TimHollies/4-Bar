define([
    'lodash',
    'svgjs',
    'scripts/randomColor/randomColor'
], function(_, svg, randomColor) {
        
    var draw;    
    var lines;
    var title;
    
    var symbolHandler = {
        "drawable": function(a) {

            if(lines[a.i] === undefined) {
                lines[a.i] = draw.group();
            } else {
                lines.splice(a.i, 0, draw.group());
                for(var i=a.i; i<lines.length; i++) {
                    if(lines[i] === undefined) continue;
                    lines[i].move(0, 25*i);
                }
            }
            
            for(var j = 0, totalOffset = 0; j < a.parsed.length; j++)
                totalOffset += drawingFunctions[a.parsed[j].type](a, j, totalOffset);
                
            lines[a.i].move(0, 25*a.i);
        },
        "data": function(a) {
            if(a.parsed[0].type === "title") {
                if(title) title.clear();
                title = draw.text(a.parsed[0].title).font({
                          family:   'Georgia'
                        , size:     32
                        , anchor:   'middle'
                        , leading:  '1.5em'
                        }).move(400, 0);
            }
        }
    }
    
    var actionHandler = {
        "add": function(a) {
            symbolHandler[a.type_class](a);
        },
        "del": function(a) {
            if(lines[a.i])lines[a.i].remove();
            lines[a.i] = undefined;
        },
        "move": function(a) {
            if(a.i<a.j) {        
                lines[a.i] = lines[a.j];
                lines[a.i].move(0, 25*a.i);
                lines[a.j] = undefined;
            }
        }
    }
    
    var drawingFunctions = {
        "note": function(a, j, totalOffset) {
            lines[a.i].rect(a.parsed[j].notelength*20,20).attr({ fill: a.error ? '#000' : randomColor({luminosity: 'dark'}) }).move(totalOffset,0);
            return a.parsed[j].notelength*20 + 5;            
        },
        "barline": function(a, j, totalOffset) {
            lines[a.i].circle(20).attr({ fill: "#CCC" }).move(totalOffset,0 + (a.i*25));
            return 25;
        }
    };
    
    
    //exported functions
    var exportFunctions = {};
    
    exportFunctions.initialize = function() {
        draw = svg('canvas');
        lines = [];
    };   
    
    exportFunctions.onNext = function(a) {
        actionHandler[a.action](a);
        return a;
    };    
    
    return exportFunctions;
});