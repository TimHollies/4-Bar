'use strict';

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),

    //well these work... but are they useful?
    tut01 = require('app/tutorial/tut/tut01.htm'),
    tut02 = require('app/tutorial/tut/tut02.htm');


module.exports = function(ractive, context, page, urlcontext, user) {

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

    ractive.on('view_tune', function(event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/editor?tuneid=" + tuneId);
    });

    ractive.set("filterTuneNames", function(tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function(a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });
 
    // toastr.success("YAY");
}; 