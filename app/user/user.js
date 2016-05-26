'use strict';

var $ = require("../engine/vendor").jquery;

var
    fade = require('../scripts/transitions/ractive.transitions.fade'),
    fly = require('../scripts/transitions/ractive.transitions.fly'),
    toastr = require('../engine/vendor').toastr;


module.exports = function(ractive, context, page, urlcontext, user) {

    ractive.on({
        'new_tune': function(event) {
            page("/editor");
        },
        "navigate_back": function(event) {
            page.show("/");
        }
    });

    ractive.on('view_tune', function(event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/editor?tuneid=" + tuneId);
    });

    $.getJSON("/api/tunes")
        .then(function(data) {
            ractive.set("tuneNames", data);
        });

    ractive.set("filterTuneNames", function(tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function(a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });

    // toastr.success("YAY");
};