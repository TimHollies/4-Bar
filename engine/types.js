'use strict';

var line_types = {
	"drawable": 0,
	"data": 1,
	"hidden": 2
};

var line_actions = {
	"delete": 0,
	"add": 1,
	"move": 2,
	"nothing": 3
};

Object.freeze(line_types);
Object.freeze(line_actions);

module.exports = {
	line_types: line_types,
	line_actions: line_actions
};