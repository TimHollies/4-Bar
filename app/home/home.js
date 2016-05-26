'use strict';

var
    fade = require('../scripts/transitions/ractive.transitions.fade'),
    fly = require('../scripts/transitions/ractive.transitions.fly'),
    toastr = require('../engine/vendor').toastr,
    ractive = require('../engine/vendor').ractive,
    _ = require('lodash');


var template = require("./home.html");


module.exports = function(ractive, context, page, urlcontext, user) {

    var onInit = function() {

        var ractive = this;

        ractive.set("showingKeySelectorPopup", false);

        ractive.on({
            'new_tune': function(event) {
                ractive.fire("navigate_to_page", "/editor");
            },
            'view_tutorial': function(event) {
                ractive.fire("navigate_to_page", "/tutorial")
            },
            'view_new_tunebook': function() {
                ractive.fire("navigate_to_page", "/tunebook")
            },
            'updated_search': function(event, data) {
                console.log("EVENT", event.context.search_filter);

                var keynoteData = ractive.get("keynote");
                var keynoteFilter = "disallowkeys=";

                _.forOwn(keynoteData, function(val, key) {
                    if(!val) {
                        if(key.length === 1) {
                            keynoteFilter += (key[0] + ",")
                         } else {
                            keynoteFilter += (key[0] + "^,")
                         }
                       
                    }
                });

                fetch("/api/tunes?name=" + event.context.search_filter + "&" + keynoteFilter)
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
            },
            'view_tunebook': function(event) {
                ractive.fire("navigate_to_page", "/tunebook/view?tunebook=" + event.node.attributes.tunebookId.value)
            },
            'view_tune': function(event) {
                var tuneId = event.node.attributes["tune-id"].value;
                console.log(tuneId);
                ractive.fire("navigate_to_page", "/viewer?tuneid=" + tuneId);
            }
        });

        ractive.on('toggle-note', function(event) {
            var note = event.node.attributes.note.value;
            ractive.set("keynote." + note, !ractive.get("keynote." + note));
            ractive.fire("updated_search", event);
        });

        ractive.on('toggle-mode', function(event) {
            var mode = event.node.attributes.mode.value;
            ractive.set("keymode." + mode, !ractive.get("keymode." + mode));
        });

        ractive.on({
            "clear-all-keys": function(event) {
                ractive.set("keynote", {
                    'A': false,
                    'A#': false,
                    'B': false,
                    'C': false,
                    'C#': false,
                    'D': false, 
                    'D#': false, 
                    'E': false, 
                    'F': false, 
                    'F#': false, 
                    'G': false,
                    'G#': false
                });
                ractive.fire("updated_search", event);
            },
             "select-all-keys": function(event) {
                ractive.set("keynote", {
                    'A': true,
                    'A#': true,
                    'B': true,
                    'C': true,
                    'C#': true,
                    'D': true, 
                    'D#': true, 
                    'E': true, 
                    'F': true, 
                    'F#': true, 
                    'G': true,
                    'G#': true
                });
                ractive.fire("updated_search", event);
            },
            "clear-all-modes": function() {
                ractive.set("keymode", {
                    'Major': false,
                    'Dorian': false,
                    'Phrygian': false,
                    'Lydian': false,
                    'Mixolydian': false,
                    'Minor': false, 
                    'Locrian': false
                });
            },
             "select-all-modes": function() {
                ractive.set("keymode", {
                    'Major': true,
                    'Dorian': true,
                    'Phrygian': true,
                    'Lydian': true,
                    'Mixolydian': true,
                    'Minor': true, 
                    'Locrian': true
                });
            },
            "key-selector-value-clicked": function() {
                ractive.set("showingKeySelectorPopup", !ractive.get("showingKeySelectorPopup"));
                return false;
            },
            "page-clicked": function() {
                if(ractive.get("showingKeySelectorPopup"))ractive.set("showingKeySelectorPopup", false);
            },
            "key-popup-clicked": function() {
                console.log("meh");
                if(ractive.get("showingKeySelectorPopup"))return false;
            }
        });

        //ractive.on("init", function() {
            fetch("/api/tunes")
            .then(function(response) {
                return response.json()
            }).then(function(data) {
                ractive.set("publicTuneNames", data);
            }).catch(function(ex) {
                console.log('parsing failed', ex)
            });


            fetch("/api/tunebooks")
            .then(function(response) {
                return response.json()
            }).then(function(data) {
                ractive.set("myTunebookNames", data);
             }).catch(function(ex) {
                console.log('parsing failed', ex)
            });

        //});

        

        ractive.set("keynote", {
            'A': true,
            'A#': true,
            'B': true,
            'C': true,
            'C#': true,
            'D': true, 
            'D#': true, 
            'E': true, 
            'F': true, 
            'F#': true, 
            'G': true,
            'G#': true
        });

        ractive.set("keymode", {
            'Major': true,
            'Dorian': true,
            'Phrygian': true,
            'Lydian': true,
            'Mixolydian': true,
            'Minor': true, 
            'Locrian': true
        });

        ractive.set("rhythm", ["Jig", "Reel"]);
    }


    var ractive = Ractive.extend({
      isolated: false,
      template: template,
      oninit: onInit
    }); 

    return ractive;
};