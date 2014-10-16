define([
    'lodash',
    'scripts/rx.helper',
    'scripts/adaptors/ractive-adaptors-rxjs',
    'engine/parser',
    'engine/render',
    'scripts/transitions/ractive.transitions.fade',
    'scripts/transitions/ractive.transitions.fly'
], function(_, Rx, adapter, parser, renderer) {
    
    'use strict';
    
    var emptyTuneName = "Untitled Tune";
    
    var model = function(ractive, context) {

        renderer.initialize();
        
        var lines = [];
        
        ractive.set("title", emptyTuneName);
        
        //incorporates an elements index into its object
        function addIndexToObject(element, index) {
            return {
                raw: element,
                i: index
            };
        }
    
        //select many:
        function linesInChange(change) {
            var currentLines = change.newValue.split("\n"),
                lineDiff = currentLines.length - lines.length,
                mappedCurrentLines = currentLines.map(addIndexToObject);
            
            if(lineDiff < 0) {
                lines = _.first(lines, lines.length + lineDiff);
                mappedCurrentLines.push({
                    type_class: "delete",
                    count: lineDiff
                });
            }
            
            return Rx.Observable.fromArray(mappedCurrentLines);
        }
        
        //filter:
        function unchangedLines(line) {
            if(line.type_class === "delete")return true;
            if(lines[line.i] === line.raw) return false;
            if(line.type_class != "delete") lines[line.i] = line.raw;
            return true;
        }        
        
        //composition root
        Rx.Observable.fromRactive(ractive, 'inputValue')
        .selectMany(linesInChange)
        .filter(unchangedLines)
        .map(parser)
        .map(renderer.onNext)
        .subscribe(function(a) { 
            console.log(a); 
            if(a.type_class === "data" && a.parsed[0].type === "title") {
                if(a.parsed[0].title.length > 0) {
                    ractive.set("title", a.parsed[0].title);
                } else {
                    ractive.set("title", emptyTuneName);
                }                
            }            
        }, function(a) { 
            console.log(a); 
        });
        
        
        //handle events
        ractive.on({
        "navigate_back": function(event) {
            window.location.hash = "";
        },
        "editor_keyup": function() {
            var field = document.getElementById("abc");
            if(field.scrollHeight > field.clientHeight) {
                console.log("grow");
                field.style.height = field.scrollHeight + "px";
            }
        }});

    }
    
    return model;
});