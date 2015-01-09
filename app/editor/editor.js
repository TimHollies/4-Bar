'use strict';

var
    _ = require('vendor').lodash,
    engine = require('engine/engine'),
    parser = engine.parser,
    renderer = engine.render,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    layout = engine.layout,
    $ = require('vendor').jquery,
    enums = require('engine/types'),
    CodeMirror = require('vendor').codeMirror,
    initializeUI = require("./ui"),
    FileSaver = require('vendor').filesaver,
    toastr = require('vendor').toastr,
    vRender = require('engine/vRender.js6'),
    Combokeys = require('vendor').combokeys;

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

    vRender.init();

    var editor = CodeMirror.fromTextArea(document.getElementById("abc"), {
        lineNumbers: true,
        mode: "htmlmixed"
    });

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

        layout.init();

        var done = diff(change)
            .map(parser)
            .reduce(layout.onNext, 0);


        vRender.render(done);
        console.log("done", done);
    }

    var debouncedRerenderScore = _.debounce(rerenderScore, 50);

    ractive.observe('inputValue', function(newValue, oldValue) {
        debouncedRerenderScore({
            newValue: newValue,
            oldValue: oldValue || ""
        });
    });

    var oldStart = -1,
        oldStop = -1;

    //handle events
    ractive.on({
        "navigate_back": function(event) {
            page.show("/");
        },
        "share_url_modal_close": function() {
            dialog.close();
        },
        "silly-save": function() {
            dispatcher.send("save_tune");
        }
    });

    dispatcher.on({
        "download_abc": function() {
            var blob = new Blob([ractive.get("inputValue")], {
                type: "text/plain;charset=utf-8"
            });
            FileSaver(blob, ractive.get("title") + ".abc");
        },
        "change_tune_title": function(data) {
            ractive.set("title", data);
        },
        "show_share_dialog": function() {
            ractive.set("quick_url", "localhost:3000/editor?tune=" + encodeURIComponent(ractive.get("inputValue")));
            dialog.show();
        },
        "save_tune": function() {
            $.ajax({
                type: "POST",
                url: "/api/tunes/add",
                data: {
                    tune: ractive.get("inputValue")
                }
            }).then(function() {
                toastr.success("Tune saved", "Success!");
            });
        }
    });

    if (parameters.tuneid) {
        $.getJSON("/api/tune/" + parameters.tuneid, function(res) {
            editor.setValue(res.data);
        });
    }

    if (parameters.tune) {
        editor.setValue(parameters.tune);
    }

    var combokeys = new Combokeys(document.getElementById("view-editor"));

    combokeys.bind("ctrl+s", function() {
        dispatcher.send("save_tune");
        return false;
    });

    editor.setValue("X: 1\nT: " + emptyTuneName);
    initializeUI();
};