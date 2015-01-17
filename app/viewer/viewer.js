'use strict';

var $ = require("vendor").jquery;

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),
    toastr = require('vendor').toastr,
    screenfull = require('vendor').screenfull,
    engine = require('engine/engine'),
    vRender = require('engine/vRender.js'),
    initializeUI = require("./ui"),
    parser = engine.parser,
    renderer = engine.render,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    layout = engine.layout;

function parseQuery(qstr) {
    var query = {};
    var a = qstr.split('&');
    for (var i in a) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
    }

    return query;
}


module.exports = function(ractive, context, page, urlcontext, user) {

    var parameters = parseQuery(urlcontext.querystring);

    //renderer.initialize();
    vRender.init();

    dispatcher.on({
        "edit_tune": function() {
            page("/editor?tuneid=" + parameters.tuneid);
        },
        "show_fullscreen": function() {
            var elem = document.getElementById('fullscreenZone');
            if (screenfull.enabled) {
                screenfull.request(elem);
            }
        },
        "publish_tune": function() {
            $.ajax({
                type: "POST",
                url: "/api/tunes/publish",
                data: {
                    tuneId: ractive.get("tune")._id
                }
            }).then(function() {
                dispatcher.send("tune_publish_success");
                toastr.success("Tune published", "Success!");
            });
        }
    });

    ractive.on({
        "navigate_back": function() {
            page("/");
        }
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

    if (parameters.tuneid) {
        $.getJSON("/api/tune/" + parameters.tuneid, function(res) {
            ractive.set("tune", res);

            initializeUI(!res.public);

            layout.init();

            var done = diff({
                    newValue: res.data,
                    oldValue: ""
                })
                .map(parser)
                .reduce(layout.onNext, 0);

            vRender.render(done);
        });
    }
    // toastr.success("YAY");
};