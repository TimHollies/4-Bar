var s = require('virtual-dom/virtual-hyperscript/svg');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');
var draw = require('./virtual_stave_symbols');

function SVG() {
	this.root = s("svg", {
		viewBox: "0 0 1000 800",
		width: "100%",
		height: "100%"
	});
}

SVG.prototype.render = function(node) {
	node.appendChild(createElement(h("div", [this.root])));
};

var doc = new SVG();

doc.root.children.push(s("rect", {
    width: "100px",
    height: "100px",
    x: "200px",
    fill: "yellow"
}));

doc.root.children.push(s("g",[draw.stave()]));

console.log(doc);

doc.render(document.body);