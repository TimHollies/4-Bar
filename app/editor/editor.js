'use strict';

var
    _ = require('vendor').lodash,
    engine = require('engine/engine'),
    parser = engine.parser,
    renderer = engine.render,
    diff = engine.diff,
    $ = require('vendor').jquery,
    dispatcher = require('engine/dispatcher'),
    enums = require('engine/types'),
    CodeMirror = require('vendor').codeMirror,
    initializeUI = require("./ui"),
    FileSaver = require('vendor').filesaver;

require('scripts/transitions/ractive.transitions.fade');
require('scripts/transitions/ractive.transitions.fly');

var emptyTuneName = "Untitled Tune";

var textFile = null,
    makeTextFile = function(text) {
        var data = new Blob([text], {
            type: 'text/plain'
        });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
    };

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

    var editor = CodeMirror.fromTextArea(document.getElementById("abc"), {
        lineNumbers: true,
        mode: "htmlmixed"
    });

    renderer.initialize();

    editor.on("change", function(instance) {
        ractive.set("inputValue", instance.getValue());
    });

    editor.on("cursorActivity", function(instance) {
        dispatcher.send("selection-changed", {
                start: instance.getCursor(true).line,
                stop: instance.getCursor(false).line
            });
    });


    var parameters = parseQuery(urlcontext.querystring);
    console.log("CTX", parameters);

    var lines = [];

    var dialog = document.getElementById('window');

    ractive.set("title", emptyTuneName);

    //incorporates an elements index into its object
    function addIndexToObject(element, index) {
        return {
            raw: element,
            i: index
        };
    }

    function rerenderScore(change) {
        diff(change)
            .map(parser)
            .map(renderer.onNext)
            .forEach(function(a) {
                if (a.type_class === enums.line_types.data && a.parsed[0].type === "title") {
                    if (!(a.action === enums.line_actions.delete) && a.parsed[0].data.length > 0) {
                        ractive.set("title", a.parsed[0].data);
                    } else {
                        ractive.set("title", emptyTuneName);
                    }
                }
            });
    }

    var debouncedRerenderScore = _.debounce(rerenderScore, 50);

    ractive.observe('inputValue', function(newValue, oldValue) {
        debouncedRerenderScore({
            newValue: newValue,
            oldValue: oldValue || ""
        });
    });

    /*
    //composition root
    var mainObservable = Rx.Observable.fromRactive(ractive, 'inputValue')
        .throttle(100)
        .selectMany(diff)
        .map(parser)
        .map(renderer.onNext)
        .subscribe(function(a) {
            //console.log(a);
            /*if (!a.error) {
                ractive.set("errors", "");
            } else {
                ractive.set("errors", a.error_details.message);
            }
            //if(a.action != "del")console.log(a.parsed); 
            
        });*/

    var oldStart = -1,
        oldStop = -1;

    //handle events
    ractive.on({
        "navigate_back": function(event) {
            page.show("/");
        },
        "share_url": function() {
            ractive.set("quick_url", "localhost:3000/editor?tune=" + encodeURIComponent(ractive.get("inputValue")));
            dialog.show();
        },
        "share_url_modal_close": function() {
            dialog.close();
        },
        "generate_abc_blob": function(event) {
            event.node.href = makeTextFile(ractive.get("inputValue"));
            event.node.download = ractive.get("title") + ".abc";
            console.log(event);
        }
    });

    dispatcher.on("download_abc", function() {
        var blob = new Blob([ractive.get("inputValue")], {type: "text/plain;charset=utf-8"});
        FileSaver(blob, ractive.get("title") + ".abc");
    });

    if (parameters.tuneid) {
        $.getJSON("/api/tunes/" + parameters.tuneid, function(res) {
            //ractive.set("inputValue", res.data);
            editor.setValue(res.data);
        });
    }

    if (parameters.tune) {
        //ractive.set("inputValue", parameters.tune);
        editor.setValue(parameters.tune);
    }

    initializeUI();
};