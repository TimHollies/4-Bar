'use strict';

var
    _ = require('vendor').lodash,
    engine = require('engine/engine'),

    ABCParser = engine.parser,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    ABCLayout = engine.layout,
    ABCRenderer = engine.render,

    $ = require('vendor').jquery,
    enums = require('engine/types'),
    CodeMirrorABCMode = require('engine/abc_mode'),
    CodeMirror = require('vendor').codeMirror,
    CodeMirrorLint = require('vendor').codeMirrorLint,
    //initializeUI = require("./ui"),
    FileSaver = require('vendor').filesaver,
    toastr = require('vendor').toastr,
    Combokeys = require('vendor').combokeys,
    Divvy = require('engine/scripts/divvy/divvy.js');

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
    for (var i = 0; i<a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
    }

    return query;
}

module.exports = function(ractive, context, page, urlcontext, user) {

    var parser = ABCParser(),
        layout = ABCLayout(),
        renderer = ABCRenderer();

    var errors = [];

    ractive.set("errors", errors);

   /*var divvy = new Divvy({
        el: document.getElementById("editor-section"), // this is a reference to the container DOM element
        columns: [     // or you can have rows instead
            'left',
            'right'
        ]
    });*/

    var editor = CodeMirror.fromTextArea(document.getElementById("abc"), {
        lineNumbers: true,
        mode: "abc",
        gutters: ["error-markers"],
        //lint: true
    });

    editor.setSize("100%", "100%");

    window.ed = editor;

    editor.on("change", function(instance, changeObj) {

        var endPos = CodeMirror.changeEnd(changeObj);

        console.log("CHANGED", changeObj);
        console.log("CHANGED", endPos);

        var
            linesRemoved = changeObj.removed.length,
            linesAdded = changeObj.text.length;

        var deletions = {
            startId: changeObj.from.line,
            count: linesRemoved,
            action: "DEL",
            lines: []
        }; 

        for(var i=0; i<linesRemoved; i++) {
            deletions.lines[i] = new AbcLine("", changeObj.from.line + i);
        }

        var count = (endPos.line - changeObj.from.line) + 1;

        var additions = {
            startId: changeObj.from.line,
            count: linesAdded,
            lines: [],
            action: "ADD"
        };

        for(var i=0; i<count; i++) {
            additions.lines[i] = new AbcLine(instance.getLine(additions.startId + i), changeObj.from.line + i);
        }

        console.log("CHANGE    ADDED: ", additions, "  REMOVED: ", deletions);

        var diffed = [deletions, additions];

        rerenderScore(diffed);
        ractive.set("inputValue", instance.getValue());
    });

    editor.on("cursorActivity", function(instance) {
        dispatcher.send("selection-changed", {
            start: instance.getCursor(true).line,
            stop: instance.getCursor(false).line
        });
    });

    dispatcher.on({
        "abc_error": (data) => {
            
            data.textMarker = editor.markText({line: data.line, ch: data.char-1}, {line: data.line, ch: data.char}, {className: "styled-background"});

            editor.setGutterMarker(data.line, "error-markers", document.createRange().createContextualFragment('<i class="fa fa-times-circle" style="color:red;padding-left: 4px;"></i>'));

            errors.push(data); 

            //ractive.update( 'errors' );
            ractive.set("errors", errors);
        },
        "remove_abc_error": (data) => {
            errors = errors.filter((c) => c.type !== data);
            ractive.set("errors", errors);
        }
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

    var oldInputValue = "";

    function rerenderScore(diffed) {             

        diffed.filter((c) => c.action === "DEL").forEach((item) => {
            errors = errors.filter((err) => {
                if(err.line < item.startId || err.line >= (item.startId + item.count)) {
                    return true;
                }
                if(err.textMarker)err.textMarker.clear();
                editor.setGutterMarker(err.line, "error-markers", null);
                return false;
            });
        });

        //ractive.update( 'errors' );
        ractive.set("errors", errors);

        var done = diffed
            .map(parser)
            .reduce(layout, 0);


        renderer(done);

        console.log("done", done);
    }

    function completelyRerenderScore() {

        $("#canvas").empty();

        parser = ABCParser();
        layout = ABCLayout();
        renderer = ABCRenderer();

        var done = diff({
            newValue: ractive.get('inputValue'),
            oldValue: ""
        })
        .map(parser)
        .reduce(layout, 0);

        renderer(done);
        console.log("done", done);
    }

    dispatcher.after("transpose_change", completelyRerenderScore);

    var oldStart = -1,
        oldStop = -1;

    //handle events
    ractive.on({
        "navigate_back": function(event) {
            window.history.back();
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
            editor.setValue(res.raw);
        });
    }

    if (parameters.tune) {
        editor.setValue(parameters.tune);
    }

    if(parameters.transpose) {
        dispatcher.send("transpose_change", parseInt(parameters.transpose));
    }

    var combokeys = new Combokeys(document.getElementById("view-editor"));

    combokeys.bind("ctrl+s", function() {
        dispatcher.send("save_tune");
        return false;
    });

    editor.setValue("X: 1\nT: " + emptyTuneName);
    //initializeUI();
};