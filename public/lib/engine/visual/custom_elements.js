'use strict';

import s from 'virtual-dom/virtual-hyperscript/svg';
import createElement from 'virtual-dom/create-element';

export function selectionBox() {
	var markerRect = s("rect", {
        x: -20,
        y: -4,
        width: 6,
        height: 40,
        fill: 'orange',
        class: 'lineIndicatorRect'
    });

    return createElement(markerRect);
}