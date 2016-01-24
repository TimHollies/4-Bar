'use strict';

//polyfill 
require('isomorphic-fetch');

module.exports = {
	lodash: require('lodash'),
	lex: require('lex'),
	Ractive: require('ractive/ractive'),
    
    page: require('page'),
    jsDiff: require('diff'),
    codeMirror: require('codemirror'),
    codeMirrorLint: require('codemirror/addon/lint/lint'),
    combokeys: require('combokeys'),
    screenfull: require('screenfull'),
    zazate: require('zazate.js'),

    queryString: require('query-string'),
    sizzle: require('sizzle'),
    domready: require('domready'),
    sortable: require('sortablejs'),
    drop: require('node_modules/drop/drop')
}; 