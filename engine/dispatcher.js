'use strict';

var Rx = require('vendor').Rx,
    _ = require('vendor').lodash;

var subscribers = new Map();

function send(eventName, data) {

    if (!subscribers.has(eventName)) {
    	console.log("No subscribers for " + eventName);
    }

    _(subscribers.get(eventName)).forEach(function(sub) {
        sub(data);
    });
}

function subscribeEvent(eventName, func) {
    if (subscribers.has(eventName)) {
        subscribers.get(eventName).push(func)
    } else {
        subscribers.set(eventName, [func]);
    }
}

function on(eventName, func) {
    if(_.isObject(eventName) && func === undefined) {
        for(var propt in eventName){
            subscribeEvent(propt, eventName[propt]);
        }
    } else {
        subscribeEvent(eventName, func);
    }    
}

module.exports = {
    on: on,
    send: send
};