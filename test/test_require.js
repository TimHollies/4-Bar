var 
    config = require('../config/webpack.config.js'),
    jsdom = require('jsdom-nogyp'),
    document = jsdom.jsdom("hello world"),
    proxyquire =  require('proxyquire');

document.implementation.addFeature(
    'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1'
);

global.document = document;
global.window = document.parentWindow;

var mockVendor = {
    lodash: require('lodash'),
    svgjs: require('svg.js'),
    lex: require('lex'),
    jsDiff: require('diff'),
    '@global': true,
    '@noCallThru': true
};

module.exports = function(module) {
    return proxyquire(module, {
      "vendor": mockVendor
    });
};