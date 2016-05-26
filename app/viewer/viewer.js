'use strict';

var 
    fade = require('../scripts/transitions/ractive.transitions.fade'),
    fly = require('../scripts/transitions/ractive.transitions.fly'),

    screenfull = require('../engine/vendor').screenfull,
    queryString = require('../engine/vendor').queryString,
    Drop = require('../engine/vendor').drop,

    engine = require('../engine/engine'),

    ABCParser = engine.parser,
    ABCRenderer = engine.render,
    diff = engine.diff,
    ABCLayout = engine.layout,
    AudioRenderer = require('../engine/audio_render'),
    ABCRenderToDOM = require('../engine/vdom2dom'),

    AudioEngine = require('../engine/audio/audio'),

    TunePlayer = require('../engine/audio/myplayer');

var template = require("./viewer.html");

module.exports = function(r) {

    var downloadOptionsTether = null;

    var onInit = function() {

        var ractive = this;

        var parameters = queryString.parse(ractive.get("url").querystring);

        ractive.set("playbackReady", false);

        var parser = ABCParser(ractive),
            layout = ABCLayout(ractive),
            renderer = ABCRenderer(ractive),
            tunePlayer = TunePlayer(ractive);

        ractive.set("playing", false);
        ractive.set("repeatingTune", false);
        ractive.set("currentTranspositionValue", 0);
        ractive.set("playTempo", 120);
        ractive.set("downloadOptionsOpen", false);

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
                if(ractive.get("playing"))ractive.fire("toggle-stop-tune");
                ractive.fire("navigate_to_page", "/editor?tuneid=" + ractive.get('tune')._id);
            },
            "toggle-stop-tune": () => {
                tunePlayer.stopTune();
                ractive.set("playing", false);
            },
            "play-tune-end": function() {
                if(ractive.get("repeatingTune")) {
                    tunePlayer.playTune(AudioRenderer(doneThing), ractive.get("playTempo"));
                } else {
                    ractive.set("playing", false);
                }                
            },
            "toggle-play-tune": () => {

                if(!ractive.get("playbackReady")) return;

                tunePlayer.playTune(AudioRenderer(doneThing), ractive.get("playTempo"));
                ractive.set("playing", true);
            },
            "toggle-repeat-tune": function() {
                ractive.set("repeatingTune", !ractive.get("repeatingTune"));
            },
            "play-tune-ready": function() {
                ractive.set("playbackReady", true)
            },
            "download_tune_options": function() {
                ractive.set("downloadOptionsOpen", true);
                downloadOptionsTether.position();
                return false;
            },
            "mouse-over-window": function() {
                ractive.set("downloadOptionsOpen", false);
            },
            "download-abc": function() {
                ractive.set("downloadOptionsOpen", false);
            },
            "download-midi": function() {
                ractive.set("downloadOptionsOpen", false);
            },
            "download-pdf": function() {
                window.location.href = "/pdf?tune=" + encodeURIComponent(ractive.get("tune").raw);
                ractive.set("downloadOptionsOpen", false);
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

                var vdom = renderer(done);
                ABCRenderToDOM(vdom);
            });
        }

        if(parameters.transpose) {
            ractive.fire("transpose_change", parseInt(parameters.transpose));
        }

        window.addEventListener("popstate", function() {
            if(ractive.get("playing"))ractive.fire("toggle-stop-tune");
        });
    }

    var onRender = function() {
        downloadOptionsTether = new Drop({
          target: document.querySelector('#download-button'),
          element: document.querySelector('.download.popover-menu'),
          attachment: 'top center',
          targetAttachment: 'bottom center',
          offset: "0px 35px"
        });
    }

    var ractive = Ractive.extend({
      isolated: false,
      template: template,
      oninit: onInit,
      onrender: onRender
    }); 

    return ractive;

};