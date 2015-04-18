'use strict';

describe('cli interface', function(){

	it('should not error when transforming a tune', function() {

		var expect = require('chai').expect;

		let engine = require("../../engine/engine");

		let fs = require('fs')
		fs.readFile('./test/data/redcrow.abc', 'utf8', function(err, data) {

		    if (err) {
		        throw err;
		    }

		    let dispatcher = require("../../engine/dispatcher");
		    let ABCRenderToString = require('../../engine/vdom2string');

		    dispatcher.get = function() {
		        return 0;
		    }

		    let renderedTune = "";

		    expect(function() {

		        let parser = engine.parser(dispatcher),
		            layout = engine.layout(dispatcher),
		            renderer = engine.render(dispatcher);

		        data = data.trim();

		        let diffed = engine.diff({
		            newValue: data,
		            oldValue: ""
		        });

		        let parsed = diffed.map(parser);
		        let done = parsed.reduce(layout, 0);
		        let vdom = renderer(done);
		        renderedTune = ABCRenderToString(vdom);

		    }).to.not.throw(Error);

		    let styles = `
			    .render-div {
				  max-width: 1200px;
				  margin-left: auto;
				  margin-right: auto;
				  margin-top: 2px;
				  padding-top: 4px;
				}
				.tune-header {
					text-align: center;
				}
		    `;

		    fs.writeFile("./test/output/test.html", `<html><head><title>The Red Crow</title><style>${styles}</style></head><body>${renderedTune}</body></html>`, function(err) {
		        if (err) {
		            throw err;
		        }
		    });
		});
	});

});