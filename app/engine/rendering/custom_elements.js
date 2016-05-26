var s = require('virtual-dom/virtual-hyperscript/svg'),
    h = require('virtual-dom/h'),
    createElement = require('virtual-dom/create-element');

module.exports = {
	selectionBox: function() {
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
};