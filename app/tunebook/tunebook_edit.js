'use strict';

var
    fade = require('scripts/transitions/ractive.transitions.fade'),
    fly = require('scripts/transitions/ractive.transitions.fly'),
    
    Sortable = require('vendor').sortable,
    siz = require('vendor').sizzle;


var template = require("./tunebook_edit.html");

module.exports = function() {

    var onInit = function() {

        var ractive = this;

        var selectedTuneCount = 0;

        var getSelectedTunes = () => siz(".tunebook-tunes .tune-list-item").map((item) => JSON.parse(item.attributes.tuneData.value));

        ractive.set("selectedTuneCount", selectedTuneCount);
        ractive.set("tunebookName", "Untitled Tunebook");

        ractive.on({
            "navigate_back": function(event) {
                ractive.fire("navigate_to_page","/");
            },
            "save-tunebook": (event) => {
                fetch('/api/tunebook/add', {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    name: ractive.get("tunebookName"),
                    tunes: getSelectedTunes()                
                    })
                });

                page.show("/");
            }
        });

        fetch("/api/tunes")
        .then(function(response) {
            return response.json()
        }).then(function(data) {
            ractive.set("publicTuneNames", data);
        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });

    }

    var onRender = function() {
        Sortable.create(siz('#allTunes')[0], { 
            group: "omega",
            sort: false,        
            animation: 150
        }); 

        Sortable.create(siz('#selectedTunes')[0], {
            group: "omega",
            animation: 150,
            onAdd: (evt) => {
                selectedTuneCount++;
                ractive.set("selectedTuneCount", selectedTuneCount);
            },
            onRemove: (evt) => {
                selectedTuneCount--;
                ractive.set("selectedTuneCount", selectedTuneCount);
            }
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