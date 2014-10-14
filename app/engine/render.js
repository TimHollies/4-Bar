define([
    'svgjs'
], function(svg) {
    
    var exportFunctions = {};
    var draw;
    
    exportFunctions.initialize = function() {
        draw = svg('canvas');
        var rect = draw.rect(300,300).attr({ fill: '#f06', id: 'woot' });
    };   
    
    exportFunctions.onNext = function(a) {
        console.log(a);
    };
    
    exportFunctions.onError = function(a) {
        console.log("error", a);
    };
    
    return exportFunctions;
});