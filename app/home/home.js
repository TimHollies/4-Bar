'use strict';

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),
    toastr = require('vendor').toastr;


module.exports = function(ractive, context, page, urlcontext, user) {

    ractive.on({
        'new_tune': function(event) {
            page("/editor");
        },
        'view_tutorial': function(event) {
            page("/tutorial");
        },
        'updated_search': (event, data) => {
            console.log("EVENT", event.context.search_filter);

            fetch("/api/tunes?name=" + event.context.search_filter)
            .then(function(response) {
                return response.json()
            })
            .then(function(data) {
                console.log("DONE", data);
                ractive.set("publicTuneNames", data);
                ractive.update("publicTuneNames");
            }).catch(function(ex) {
                console.log('parsing failed', ex)
            });
        }
    });

    ractive.on('view_tune', function(event) {
        var tuneId = event.node.attributes["tune-id"].value;
        console.log(tuneId);
        page("/viewer?tuneid=" + tuneId);
    });

    fetch("/api/tunes")
    .then(function(response) {
        return response.json()
    }).then(function(data) {
        ractive.set("publicTuneNames", data);
    }).catch(function(ex) {
        console.log('parsing failed', ex)
    });

    fetch("/api/user/tunes")
    .then(function(response) {
        return response.json()
    }).then(function(data) {
        ractive.set("myTuneNames", data);
    }).catch(function(ex) {
        console.log('parsing failed', ex)
    });

    ractive.set("keynote", ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    ractive.set("rhythm", ["Jig", "Reel"]);

};