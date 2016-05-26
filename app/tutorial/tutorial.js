'use strict';

var
    fade = require('../scripts/transitions/ractive.transitions.fade'),
    fly = require('../scripts/transitions/ractive.transitions.fly'),

    //well these work... but are they useful?
    tut01 = require('./tut/tut01.html'),
    tut02 = require('./tut/tut02.html');


var template = require("./tutorial.html");

module.exports = function() {

    var onInit = function() {

        var ractive = this;

        ractive.on({
            'new_tune': function(event) {
                page("/editor");
            },
            "navigate_back": function(event) {
                window.history.back();
            },
            "goto_p1": (event) => {
                console.log("p1");
            },
            "goto_p2": (event) => {
                console.log("p2");
            }
        });
    }
 
    var ractive = Ractive.extend({
      isolated: false,
      template: template,
      oninit: onInit
    }); 

    return ractive;
}; 