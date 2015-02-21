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
    ABCLayout = engine.layout,
    AudioRenderer = require('engine/audio_render'),

    AudioEngine = require('engine/audio/audio'),

    tunePlayer = require('engine/audio/myplayer');


var template = require("./viewer.html");

module.exports = function(r) {

    var onInit = function() {

        var ractive = this;

        var parameters = queryString.parse(ractive.get("url").querystring);

        var parser = ABCParser(ractive),
        layout = ABCLayout(ractive),
        renderer = ABCRenderer(ractive);

        ractive.set("playing", false);
      
        var tuneStopper = null;

        ractive.on({
            show_fullscreen() {
                var elem = document.getElementById('fullscreenZone');
                if (screenfull.enabled) {
                    screenfull.request(elem);
                }
            },
            publish_tune() {
                $.ajax({
                    type: "POST",
                    url: "/api/tunes/publish",
                    data: {
                        tuneId: ractive.get("tune")._id
                    }
                }).then(function() {
                    ractive.fire("tune_publish_success");
                    toastr.success("Tune published", "Success!");
                });
            },
            end_of_tune() {            
                ractive.set("playing", false);
            },    
            "navigate_back": function() {
                window.history.back();
            },
            "edit_tune": () => { 
                ractive.fire("navigate_to_page", "/editor?tuneid=" + ractive.get('tune')._id);
            },
            "toggle-stop-tune": () => {
                if(tuneStopper !== null)tuneStopper();
                ractive.set("playing", false);
            },
            "toggle-play-tune": () => {

                //AudioEngine.play();

                tuneStopper = tunePlayer(AudioRenderer(doneThing));

                ractive.set("playing", true);
            }
        });

        var doneThing = null;

        if (parameters.tuneid) {

            fetch("/api/tune/" + parameters.tuneid)
            .then(function(response) {
                return response.json()
            }).then(function(res) {

                ractive.set("tune", res);

                var diffed = diff({
                    newValue: res.raw,
                    oldValue: ""
                });
                var parsed = diffed.map(parser);
                var done = parsed.reduce(layout, 0);

                doneThing = done;

                renderer(done);
                console.log("It WORKED!!", res);



            });
        }

        if(parameters.transpose) {
            ractive.fire("transpose_change", parseInt(parameters.transpose));
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
    }

    var ractive = Ractive.extend({
      isolated: false,
      template: template,
      oninit: onInit
    }); 

    return ractive;

};