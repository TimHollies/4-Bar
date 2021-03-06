// injects the vDOM structure into the actual DOM tree
// BROWSER ONLY

'use strict';

import createElement from 'virtual-dom/create-element';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';

var renderElement = null;
var lastVDOMTree = null;
var lastRenderElement = null;
 
export function VDom2DOM(vDOMTree) {

	var canvasElement = document.getElementById("canvas");
	
	if(false) {
		let diffed = diff(lastVDOMTree, vDOMTree);
		let ro = patch(lastRenderElement, diffed);

		console.log(diffed, ro);

	} else {
		canvasElement.innerHTML = "";
		renderElement = createElement(vDOMTree);
		lastRenderElement = renderElement;
		canvasElement.appendChild(renderElement);
	}

	lastVDOMTree = vDOMTree; 

    var svgs = document.getElementById("tuneSVGCanvas");    

    var scrollDist = canvasElement.scrollTop;
    svgs.viewBox.baseVal.height = svgs.getBBox().height + 100;
    canvasElement.scrollTop = scrollDist;
}