'use strict';

var
    _ = require('vendor').lodash,
    Rx = require('scripts/rx.helper'),
    adapter = require('scripts/adaptors/ractive-adaptors-rxjs'),
    engine = require('engine/engine'),
    parser = engine.parser,
    renderer = engine.render,
    diff = engine.diff,
    dispatcher = require('engine/dispatcher'),
    enums = require('engine/types');

require('scripts/transitions/ractive.transitions.fade');
require('scripts/transitions/ractive.transitions.fly');

var emptyTuneName = "Untitled Tune";

module.exports = function(ractive, context) {

    renderer.initialize();

    var lines = [];

    ractive.set("title", emptyTuneName);

    //incorporates an elements index into its object
    function addIndexToObject(element, index) {
        return {
            raw: element,
            i: index
        };
    }

    //composition root
    var mainObservable = Rx.Observable.fromRactive(ractive, 'inputValue')
        .throttle(25)
        .selectMany(diff)
        .map(parser)
        .map(renderer.onNext)
        .subscribe(function(a) {
            if (!a.error) {
                ractive.set("errors", "");
            } else {
                ractive.set("errors", a.error_details.message);
            }
            //if(a.action != "del")console.log(a.parsed); 
            if (a.type_class === enums.line_types.data && a.parsed[0].type === "title") {
                if (!(a.action === enums.line_actions.delete) && a.parsed[0].data.length > 0) {
                    ractive.set("title", a.parsed[0].data);
                } else {
                    ractive.set("title", emptyTuneName);
                }
            }
        });

    var oldStart = -1,
        oldStop = -1;

    function checkTextAreaSelection() {
        var field = document.getElementById("abc"),
            start = field.value.substr(0, field.selectionStart).split("\n").length,
            stop = field.value.substr(0, field.selectionEnd).split("\n").length;

        if (start != oldStart || stop != oldStop) {
            dispatcher.send({
                type: "selection-changed",
                start: start,
                stop: stop
            });
            oldStart = start;
            oldStop = stop;
        }
    }

    //handle events
    ractive.on({
        "navigate_back": function(event) {
            window.location.hash = "";
        },
        "editor_mouseup": function() {
            var field = document.getElementById("abc");
            checkTextAreaSelection();
        },
        "editor_keyup": function() {
            var field = document.getElementById("abc");
            if (field.scrollHeight > field.clientHeight) {
                console.log("grow");
                field.style.height = field.scrollHeight + "px";
            }

            checkTextAreaSelection();
        },
        "app_mouseup": function() {
            checkTextAreaSelection();
        }
    });

};