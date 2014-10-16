define([
    'lodash',
    'svgjs',
    'scripts/randomColor/randomColor'
], function(_, svg, randomColor) {
        
    var draw;    
    var lines;
    
    var symbolHandler = {
        "delete": function(a) {
            var toRemove = _.last(lines, -a.count).forEach(function(oldGroup) {
                oldGroup.remove();
            });
            
            lines = _.first(lines, lines.length + a.count);
        },
        "drawable": function(a) {
            if(lines[a.i] === undefined) {
                lines[a.i] = draw.group();
            }

            lines[a.i].clear();

            for(var j = 0, totalOffset = 0; j < a.parsed.length; j++)
                totalOffset += drawingFunctions[a.parsed[j].type](a, j, totalOffset);
        },
        "data": function(a) {
            if(a.parsed[0].type === "title") {
                //document.title = a.parsed[0].title;
            }
        }
    }
    
    var drawingFunctions = {
        "note": function(a, j, totalOffset) {
            lines[a.i].rect(a.parsed[j].notelength*20,20).attr({ fill: a.error ? '#000' : randomColor() }).move(totalOffset,0 + (a.i*25));
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
        symbolHandler[a.type_class](a);
        return a;
    };    
    
    return exportFunctions;
});