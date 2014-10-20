var require = require("requirejs");
var testrunner = require("qunit");

testrunner.config.autostart = false;

require(["engine/parser"], function(parserFactory) {
    
    testrunner.init();
    
    testrunner.test( "hello test", function( assert ) {
      assert.ok( 1 == "1", "Passed!" );
    });
});