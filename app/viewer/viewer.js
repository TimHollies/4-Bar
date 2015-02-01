'use strict';

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),

    screenfull = require('vendor').screenfull,
    queryString = require('vendor').queryString,

    engine = require('engine/engine'),

    ABCParser = engine.parser,
    ABCRenderer = engine.render,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    ABCLayout = engine.layout,
    AudioRenderer = engine.audioRender,

    AudioEngine = engine.audio;


module.exports = function(ractive, context, page, urlcontext, user) {

    var parameters = queryString.parse(urlcontext.querystring);

    var parser = ABCParser(),
        layout = ABCLayout(),
        renderer = ABCRenderer();

    ractive.set("playing", false);

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
        },
        "end-of-tune": function() {            
            ractive.set("playing", false);
        }
    });

    ractive.on({
        "navigate_back": function() {
            window.history.back();
        },
        "edit_tune": () => { 
            page("/editor?tuneid=" + ractive.get('tune')._id);
        },
        "toggle-stop-tune": () => {
            AudioEngine.stop();
            ractive.set("playing", false);
        },
        "toggle-play-tune": () => {

            AudioEngine.play(AudioRenderer(doneThing));

            ractive.set("playing", true);
        }
    });

    ractive.set("filterTuneNames", function(tuneNames, filter) {
        if (filter.length <= 0) return tuneNames;
        return tuneNames.filter(function(a) {
            return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
        });
    });

    var doneThing = null;

    if (parameters.tuneid) {

        fetch("/api/tune/" + parameters.tuneid)
        .then(function(response) {
            return response.json()
        }).then(function(res) {

            ractive.set("tune", res);

            var done = diff({
                    newValue: res.raw,
                    oldValue: ""
                })
                .map(parser)
                .reduce(layout, 0);

            doneThing = done;

            renderer(done);



        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    }

    if(parameters.transpose) {
        dispatcher.send("transpose_change", parseInt(parameters.transpose));
    }

    window.getTune = () => {
        var tune = doneThing;

        var outTune = [];

        tune.scoreLines.forEach((line) => {

            line.symbols
            .filter((symbol) => symbol.type === "note")
            .forEach((note) => {
                outTune.push([note.pitch + ((note.octave - 4) * 12), note.noteLength * 16])
            });
        });

        return outTune;
    }

};