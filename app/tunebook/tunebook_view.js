'use strict';

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),
    
    Sortable = require('vendor').sortable,
    siz = require('vendor').sizzle,

    queryString = require('vendor').queryString,
    _ = require('vendor').lodash,

    engine = require('engine/engine'),

    ABCParser = engine.parser,
    ABCRenderer = engine.render,
    diff = engine.diff,
    dispatcher = engine.dispatcher,
    ABCLayout = engine.layout,
    AudioRenderer = engine.audioRender,

    AudioEngine = engine.audio;

var setListIdRegex = /^set_(.*)_list$/;


module.exports = function(ractive, context, page, urlcontext, user) {

    var selectedTuneCount = 0;
    var params = queryString.parse(urlcontext.querystring);

    ractive.set("selectedItem", "");
    var tunebookData = {};

    if(params.tunebook != undefined) {
        fetch("/api/tunebook/" + params.tunebook)
        .then(function(response) {
            return response.json()
        }).then(function(data) {
            tunebookData = data;
            ractive.set("tunebook", data); 
        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    } else {
        //error
    }

    var updateListOrderFunc = function(evt) {
        console.log(evt);
        var movedTune = null;

        if(evt.from.id === "tunebookTunes") {
            movedTune = tunebookData.tunes.splice(evt.oldIndex, 1);
        } else {
            var regexTestResult = setListIdRegex.exec(evt.from.id);
            if(regexTestResult !== null) {
                var currentSet = _.find(tunebookData.tunes, function(tuneItem) {
                     return tuneItem.type === "set" && tuneItem._id === ("set_" + regexTestResult[1])
                });
                movedTune = currentSet.tunes.splice(evt.oldIndex, 1);
            }
        }

        if(evt.target.id === "tunebookTunes") {
            tunebookData.tunes.splice(evt.newIndex, 0, movedTune[0]);
        } else {
            var regexTestResult = setListIdRegex.exec(evt.target.id);
            if(regexTestResult !== null) {
                var currentSet = _.find(tunebookData.tunes, function(tuneItem) {
                     return tuneItem.type === "set" && tuneItem._id === ("set_" + regexTestResult[1])
                });
                currentSet.tunes.splice(evt.newIndex, 0, movedTune[0]);
            }
        } 

        ractive.set("tunebook", tunebookData); 
    }

    ractive.on({ 
        "navigate_back": function(event) {
            page.show("/");
        },
        "tune_item_click": function(event) {

            var tuneId = event.node.attributes.tuneId.value;

            ractive.set("selectedItem", tuneId);

            fetch("/api/tune/" + tuneId)
            .then(function(response) {
                return response.json()
            }).then(function(res) {

                var parser = ABCParser(),
                    layout = ABCLayout(),
                    renderer = ABCRenderer();

                ractive.set("tune", res);

                var diffed = diff({
                        newValue: res.raw,
                        oldValue: ""
                    });
                var parsed = diffed.map(parser);
                var done = parsed.reduce(layout, 0);

                renderer(done);
                console.log("It WORKED!!", res);

            });
        },
        "set_item_click": function(event) {

            var setId = event.node.attributes.setId.value;
            ractive.set("selectedItem", setId);

            siz('#canvas')[0].innerHTML = "<h3>YAY A SET</h3>";
        },
        "add-new-set": function() {

            var newId = _.uniqueId("set_");

            tunebookData.tunes.push({
                name: "Set",
                type: "set",
                _id: newId,
                tunes: []
            });
            
            Sortable.create(siz('#' + newId + "_list")[0], { 
                animation: 150,
                group: "omega",
                handle: ".drag-handle",
                onSort: updateListOrderFunc
            });              
        },
        "convert-to-set": function(event) {

            var arrayId = event.node.attributes.arrayId.value;

            var newId = _.uniqueId("set_");

            var oldTune = tunebookData.tunes[arrayId];

            tunebookData.tunes.splice(arrayId, 1, {
                name: "Set",
                type: "set",
                _id: newId,
                tunes: [oldTune]
            });

            Sortable.create(siz('#' + newId + "_list")[0], { 
                animation: 150,
                group: "omega",
                handle: ".drag-handle",
                //onSort: updateListOrderFunc
            });  
        }
    }); 

    Sortable.create(siz('#tunebookTunes')[0], { 
        animation: 150,
        group: "omega",
        handle: ".drag-handle",
        onSort: updateListOrderFunc
    });   
};