define([
 'engine/abc'
], function(parser) {
    'use strict';
    return function(inputValue) {
        try {
            inputValue = parser.parse(inputValue);
        } catch(exception) {
            inputValue = exception;
        }
        return inputValue;
    }    
});