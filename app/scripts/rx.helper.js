define([
    'rx'
], function(Rx) {
    
    'use strict';
    
    //create RxObserveables from ractive observe
    Rx.Observable.fromRactive = function(ractive, name) {
        return Rx.Observable.create(function(observer) {
            ractive.observe(name, function(newValue) {
                observer.onNext(newValue);
            });
        });       
    }
    
    return Rx;
});