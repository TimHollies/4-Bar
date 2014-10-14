define([
 'engine/lexer',
 'lodash'
], function(lexer, _) {
    'use strict';        
    
    var buffer = "";
    var objectStore = [];
    var map = [];
    
    window.lex = function(input) {
        lexer.lex(input, function(a) { console.log(a); });
    }
    
    return function(inputValue) {
        var 
            toParse,
            out,
            objectStoreOffset = 0;
        
        if(objectStore.length > 0) {
            objectStoreOffset = -1;
            while(inputValue.start + objectStoreOffset > 0) {
                if(objectStore[inputValue.start + objectStoreOffset])break;
                objectStoreOffset--;
            }
        }
        
        toParse = objectStore[inputValue.start + objectStoreOffset] ? objectStore[inputValue.start + objectStoreOffset].text + inputValue.text : inputValue.text;
        var out = lexer.collect(toParse);
        if(out.length === 0)return null;
        
        for(var i=0; i<out.length; i++) {
            var startId = out[i].id + inputValue.start + objectStoreOffset;
            objectStore[startId] = out[i];
            for(var j=0; j<out[i].text.length; j++)map[startId + j] = startId;
        }       

        return objectStore;       
    }    
});