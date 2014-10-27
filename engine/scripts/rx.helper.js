
    Rx = require('rx');

    'use strict';
    
    //create RxObserveables from ractive observe
    Rx.Observable.fromRactive = function(ractive, name) {
        return Rx.Observable.create(function(observer) {
            ractive.observe(name, function(newValue, oldValue) {
                observer.onNext({ newValue: newValue, oldValue: oldValue});
            });
        });       
    }
    
    //create RxObserveables from lexer
    Rx.Observable.fromJsLex = function(lexer, inputValue) {
        return Rx.Observable.create(function(observer) {
            lexer.lex(inputValue, function(a) { observer.onNext(a); });
        });       
    }    
    module.exports = Rx;
