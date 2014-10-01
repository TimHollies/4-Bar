define([
    'scripts/rx.helper',
    'scripts/adaptors/ractive-adaptors-rxjs',
    'scripts/transitions/ractive.transitions.fade',
    'engine/parser'
    //'engine/rendering/webGLRender'
], function(Rx, adapter, parser) {
    
    'use strict';
    
    var model = function(ractive, context) {

        ractive.on('new_tune', function(event) {
            window.location.hash = "editor";
        });  

    }
    
    return model;
});