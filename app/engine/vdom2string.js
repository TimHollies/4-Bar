//converts VDOM tree to string. Trivial with current VDOM implmentation.

'use strict';

var
	stringify = require('virtual-dom-stringify');

var vDom2String = function(vDOMTree) {
	return stringify(vDomTree);
}

module.exports = vDomString;