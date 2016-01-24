'use strict';

var _ = require('lodash');

var subscribers = new Map(),
    afterSubscribers = new Map();

var disconnectId = 0;

function send(eventName, data) {

    _(subscribers.get(eventName)).forEach(function(sub) {
        sub.f(data);
    });

    _(afterSubscribers.get(eventName)).forEach(function(sub) {
        sub.f(data);
    });
}

function subscribeEvent(subList, eventName, func) {

    var connection = {
        id: disconnectId,
        f: func
    };

    disconnectId++;

    if (subList.has(eventName)) {
        subList.get(eventName).push(connection)
    } else {
        subList.set(eventName, [connection]);
    }

    return disconnectId - 1;
}

function on(eventName, func) {
    if(_.isObject(eventName) && func === undefined) {
        for(var propt in eventName){
            subscribeEvent(subscribers, propt, eventName[propt]);
        }
    } else {
        return subscribeEvent(subscribers, eventName, func);
    }    
}

function off(id) {

    subscribers.forEach(function(value, key) {
      var toRemove = _.findIndex(value, function (v) { return v.id === id });
        if(toRemove !== -1) {
            value.splice(toRemove, 1);
        }
    });
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
    off: off,
    send: send,
    fire: send,
    after: after
};