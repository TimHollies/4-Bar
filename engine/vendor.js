'use strict';

//polyfill 
require('isomorphic-fetch');

module.exports = {
	lodash: require('lodash'),
	lex: require('lex'),
	Ractive: require('ractive/ractive.runtime'),
    
    page: require('page'),
    jsDiff: require('diff'),
    codeMirror: require('codemirror'),
    codeMirrorLint: require('codemirror/addon/lint/lint'),
    filesaver: require('filesaver.js'),
    combokeys: require('combokeys'),
    screenfull: require('screenfull'),
    zazate: require('zazate.js'),

    queryString: require('query-string'),
    sizzle: require('sizzle'),
    domready: require('domready'),
    sortable: require('sortablejs')
};