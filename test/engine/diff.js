var tquire = require('../test_require');

var should = require('chai').should();

var lex = tquire("../engine/diff");

describe('Diff', function() {
    describe('should', function() {

        it('should return a single item when parsing `A`', function() {
            lex("A").length.should.equal(1);
        });

        it('should return two items when parsing `A2`', function() {
            lex("A2").length.should.equal(2);
        });

        it('should return three items when parsing `A\'2`', function() {
            lex("A'2").length.should.equal(3);
        });

        it('should throw an error when parsing `T2`', function() {
            (function() {
                lex("T2");
            }).should.throw(Error);
        });
    })
});