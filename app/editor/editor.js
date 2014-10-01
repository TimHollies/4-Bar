define([
    'scripts/rx.helper',
    'scripts/adaptors/ractive-adaptors-rxjs',
    'engine/parser',
    'scripts/transitions/ractive.transitions.fade'
    //'engine/rendering/webGLRender'
], function(Rx, adapter, parser) {
    
    'use strict';
    
    var model = function(ractive, context) {

        function updateOutput(newOutput) {
            console.log(newOutput);
            ractive.set("outputValue", newOutput);
        }
        
        //composition root?
        Rx.Observable.fromRactive(ractive, 'inputValue')
        .map(parser)
        .subscribe(updateOutput);
        
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