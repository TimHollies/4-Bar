var assert = require("assert");
var require = require('amdrequire');
var should = require('chai').should();

require(["../app/engine/parser/basicParser"], function(parserFactory) {
    describe('Array', function() {
        describe('#indexOf()', function() {
            it('should return -1 when the value is not present', function() {
            	var parser = parserFactory.createParser();

                should.equal(parser.parse('A'), "");
            });
        });
    });
});