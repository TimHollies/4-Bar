define([
 'engine/lexer',
 'lodash'
], function(lexer, _) {
    'use strict';        
    
    window.lex = function(input) {
        lexer.lex(input, function(a) { console.log(a); });
    }
    
    return function(line) {

        if(line.type_class != "delete") {
            line.parsed = lexer.collect(line.raw);
                
            if(line.parsed.length === 1 && line.parsed[0].type_class === "data") {
                line.type_class = "data";
            } else {
                line.type_class = "drawable";
            }
            
            if(_.last(line.parsed) instanceof Error) {
                line.error = true;
                line.parsed = _.without(line.parsed, _.last(line.parsed));
            }
        }        
        
        return line;       
    }    
});