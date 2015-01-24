'use strict';

var _ = require('vendor').lodash;

var subscribers = new Map(),
    afterSubscribers = new Map();

function send(eventName, data) {

    if (!subscribers.has(eventName)) {
    	console.log("No subscribers for " + eventName, data);
    }

    _(subscribers.get(eventName)).forEach(function(sub) {
        sub(data);
    });

    _(afterSubscribers.get(eventName)).forEach(function(sub) {
        sub(data);
    });
}

function subscribeEvent(subList, eventName, func) {
    if (subList.has(eventName)) {
        subList.get(eventName).push(func)
    } else {
        subList.set(eventName, [func]);
    }
}

function on(eventName, func) {
    if(_.isObject(eventName) && func === undefined) {
        for(var propt in eventName){
            subscribeEvent(subscribers, propt, eventName[propt]);
        }
    } else {
        subscribeEvent(subscribers, eventName, func);
    }    
}

function after(eventName, func) {
    if(_.isObject(eventName) && func === undefined) {
        for(var propt in eventName){
            subscribeEvent(afterSubscribers, propt, eventName[propt]);
        }
    } else {
        subscribeEvent(afterSubscribers, eventName, func);
    }    
}

module.exports = {
    on: on,
    send: send,
    after: after
};