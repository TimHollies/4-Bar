var Rx = require('vendor').Rx,
	_ = require('vendor').lodash;

var subscribers = [];

function send(data) {
	//console.log("DISPATCH", data);
	_(subscribers).forEach(function(sub) {
		sub(data);
	});
}

function subscribe(func) {
	subscribers.push(func);
}

module.exports = {
	subscribe: subscribe,
	send: send
};