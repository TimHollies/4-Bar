'use strict';

import _ from 'lodash';

//import Diff from './engine/diff';
import { ABCParser } from './engine/parser';

import { ABCLayout } from './engine/layout';
import { ABCRenderer } from './engine/render';
import { ABCAudioRenderer } from './engine/audio_render';
import { TunePlayer } from './engine/audio/myplayer';
import { AbcLine } from './engine/types/LineCollection';
import { VDom2DOM } from './engine/vdom2dom';

import Ractive from 'ractive';
import siz from 'sizzle';
import CodeMirror from 'codemirror';

import * as customElements from './engine/visual/custom_elements';

// var
//     //_ = require('vendor').lodash,
//     //engine = require('engine/engine'),

//     //ABCParser = engine.parser,
//     //diff = engine.diff,
//     //dispatcher = engine.dispatcher,
//     //ABCLayout = engine.layout,
//     //ABCRenderer = engine.render,
//     ABCRenderToDOM = require('engine/vdom2dom'),

//     AudioEngine = require('engine/audio/audio'),

//     customElements = require('engine/rendering/custom_elements'),
//     CodeMirrorABCMode = require('scripts/abc_mode'),
//     CodeMirror = require('vendor').codeMirror,
//     CodeMirrorLint = require('vendor').codeMirrorLint,
//     //siz = require('vendor').sizzle,
//     //queryString = require('vendor').queryString,

//     FileSaver = require('vendor').filesaver,
//     toastr = require('vendor').toastr,
//     Combokeys = require('vendor').combokeys,
//     AbcLine = require('engine/types/LineCollection').AbcLine,

//     TunePlayer = require('engine/audio/myplayer');

// require('scripts/transitions/ractive.transitions.fade');
// require('scripts/transitions/ractive.transitions.fly');


let emptyTuneName = "Untitled Tune"; 

let textFile = null,
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

//var template = require("./editor.html");

export function Editor() {

    var onInit = function() {

        var ractive = this;

        var parser = ABCParser(ractive, 0),
            layout = ABCLayout(ractive),
            renderer = ABCRenderer(ractive),
            tunePlayer = TunePlayer(ractive);

        var transposeAmount = 0;

        var errors = [];
        var processedTune = null;

        var parameters = {};//queryString.parse(ractive.get("url").querystring);

        ractive.set("errors", errors);
        ractive.set("playing", false);

        ractive.set("showingTranspositionDropdown", false);
        ractive.set("selectedTransposition", "No Transposition");
        ractive.set("currentTranspositionValue", 0);
        ractive.set("playTempo", 120);

        ractive.on({
            "abc_error": (data) => {
                data.markers = [];

                var editor = ractive.get('editor');
                data.markers.push(editor.markText({line: data.line, ch: data.char-1}, {line: data.line, ch: data.char}, {className: "styled-background"}));
                data.markers.push(editor.markText({line: data.line, ch: data.char}, {line: data.line, ch: editor.getLine(data.line).length}, {className: "error-not-drawn"}));

                editor.setGutterMarker(data.line, "error-markers", document.createRange().createContextualFragment('<i class="fa fa-times-circle" style="color:red;padding-left: 4px;"></i>'));

                errors.push(data); 

                //ractive.update( 'errors' );
                ractive.set("errors", errors);
            },
            "remove_abc_error": (data) => {
                errors = errors.filter((c) => c.type !== data);
                ractive.set("errors", errors);
            },
            "navigate_back": function(event) {
                window.history.back();
            },
            "share_url_modal_close": function() {
                dialog.close();
            },
            "silly-save": function() {
                ractive.fire("save_tune");
            },
            "show-transposition-menu": () => {
                ractive.set("showingTranspositionDropdown", !ractive.get("showingTranspositionDropdown"));
            },
            "selectTransposition": (event) => {

                var intValue = parseInt(event.node.attributes.val.value);
                transposeAmount = intValue;
                ractive.fire("transpose_change", intValue);
                ractive.set("currentTranspositionValue", intValue);
                parser = ABCParser(ractive, intValue);

                var currentTuneVal = ractive.get('editor').getValue();
                ractive.get('editor').setValue("");
                ractive.get('editor').setValue(currentTuneVal);
                
                ractive.set("selectedTransposition", event.node.innerText);
                ractive.set("showingTranspositionDropdown", false);
            },
            "toggle-play-tune": () => {
                //AudioEngine.play(AudioRenderer(processedTune));
                tunePlayer.playTune(ABCAudioRenderer(processedTune), this.get("playTempo"));
                ractive.set("playing", true);
            },
            "toggle-stop-tune": () => {
                tunePlayer.stopTune();
                ractive.set("playing", false);
            },
            "play-tune-end": function() {
                ractive.set("playing", false);
            },
            "download_abc": function() {
                var blob = new Blob([ractive.get("inputValue")], {
                    type: "text/plain;charset=utf-8"
                });
                //FileSaver(blob, ractive.get("title") + ".abc");
            },
            "change_tune_title": function(data) {
                ractive.set("title", data);
            },
            "show_share_dialog": function() {
                ractive.set("quick_url", "localhost:3000/editor?tune=" + encodeURIComponent(ractive.get("inputValue")));
                dialog.show();
            },
            "selection-changed": function(changedTo) {

                siz(".lineIndicatorRect").forEach(function(r) { r.remove(); });

                for(var i=changedTo.start; i <= changedTo.stop; i++) {

                    var line1 = document.getElementById(`line-${i}`);
                    if(line1 !== null) {       
                        line1.appendChild(customElements.selectionBox());
                    }

                }                
            }
        });

        var dialog = document.getElementById('window');

        ractive.set("title", emptyTuneName);

        //incorporates an elements index into its object
        function addIndexToObject(element, index) {
            return {
                raw: element,
                i: index
            };
        }

        ractive.on('rerenderScore', function(diffed) {    

            var editor = ractive.get('editor');         

            diffed.filter((c) => c.action === "DEL").forEach((item) => {
                errors = errors.filter((err) => {
                    if(err.line < item.startId || err.line >= (item.startId + item.count)) {
                        return true;
                    }
                    if(err.markers)err.markers.forEach((marker) => marker.clear());
                    editor.setGutterMarker(err.line, "error-markers", null);
                    return false;
                });
            });

            //ractive.update( 'errors' );
            ractive.set("errors", errors);

            var done = diffed
                .map(parser)
                .reduce(layout, 0);


            var vdom = renderer(done);
            VDom2DOM(vdom);

            processedTune = done;

            if(window)ractive.set("lastRenderTime", window.performance.now() - ractive.get('timeAtStart'));
        });     


        if (parameters.tune) {
            editor.setValue(parameters.tune);
        }

        if(parameters.transpose) {
            ractive.fire("transpose_change", parseInt(parameters.transpose));
        }       

        window.addEventListener("popstate", function() {
            if(ractive.get("playing"))ractive.fire("toggle-stop-tune");
        });
    }

    var onRender = function() {

        var ractive = this;

        var editor = CodeMirror.fromTextArea(document.getElementById("abc"), {
            lineNumbers: true,
            mode: "abc",
            gutters: ["error-markers"],
        });

        //editor.setSize("100%", "100%");

        ractive.set('timeAtStart', null);

        editor.on("change", function(instance, changeObj) {

            if(window)ractive.set('timeAtStart', window.performance.now());

            var endPos = CodeMirror.changeEnd(changeObj);

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

            var diffed = [deletions, additions];

            ractive.fire('rerenderScore', diffed);
            
            ractive.set("inputValue", instance.getValue());
        });

        editor.on("cursorActivity", function(instance) {
            ractive.fire("selection-changed", {
                start: instance.getCursor(true).line,
                stop: instance.getCursor(false).line
            });
        });
        
        editor.setValue("X: 1\nT: " + emptyTuneName);

        ractive.set('editor', editor);
        
        window.edit = editor;
    }

    var ractive = new Ractive({
        el: "#stage",
      isolated: false,
      template: '#template',
      oninit: onInit,
      onrender: onRender
    });

    return ractive;
};