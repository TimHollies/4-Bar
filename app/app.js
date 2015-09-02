'use strict';

var consoleKeeper = console;

var
    Ractive = require('vendor').Ractive,
    _ = require('vendor').lodash,
    domready = require('vendor').domready;

console = consoleKeeper;

domready(() => {

    require('./editor/editor')();
});