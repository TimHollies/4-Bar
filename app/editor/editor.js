define([
    'scripts/rx.helper',
    'scripts/adaptors/ractive-adaptors-rxjs',
    'engine/parser',
    'engine/render',
    'scripts/transitions/ractive.transitions.fade'
], function(Rx, adapter, parser, renderer) {
    
    'use strict';
    
    var model = function(ractive, context) {

        function getStringDifference(change) {
            var 
                oldLength = change.oldValue ? change.oldValue.length : 0,
                diff = change.newValue.length - oldLength,
                minLength = diff > 0 ? oldLength : change.newValue.length,
                i=0;
            
            while(i < minLength && change.newValue[i] === change.oldValue[i])i++;
            
            console.log(diff, i);
            return {
                text: change.newValue.substr(i, diff),
                start: i,
                length: diff
            };
        }
        
        renderer.initialize();
        
        //composition root?
        Rx.Observable.fromRactive(ractive, 'inputValue')
        .map(getStringDifference)
        .map(parser)
        .subscribe(renderer.onNext, renderer.onError);
        
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
        },
        "editor_paste": function(a) {
            console.log("Pasting is mean", a.original.clipboardData.getData('text/plain').length);
        }});

    }
    
    return model;
});