define([
    'scripts/rx.helper',
    'scripts/adaptors/ractive-adaptors-rxjs',
    'scripts/transitions/ractive.transitions.fade',
    'toastr'], 
       function(Rx, adapter, fade, toastr) {
    
    'use strict';

    var model = function(ractive, context) {

        ractive.set("loggedIn", false);

        ractive.on('new_tune', function(event) {
            window.location.hash = "editor";
        });        

        $.getJSON("/api/tunes")
        .then(function(data) {
            ractive.set("tuneNames", data);
        });

        $.getJSON("/api/user/current")
        .then(function(data) {
            console.log("CURRENT USER" , data);
            ractive.set("loggedIn", true);
            ractive.set("user", data);
        });
        
        ractive.set("filterTuneNames", function(tuneNames, filter) {
            if(filter.length <= 0) return tuneNames;
            return tuneNames.filter(function(a) {
                return a.name.toLowerCase().lastIndexOf(filter.toLowerCase(), 0) === 0;
            });
        });

       // toastr.success("YAY");
    }
    
    return model;
});