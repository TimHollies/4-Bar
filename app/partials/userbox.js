var $ = require('vendor').jquery,
page = require('vendor').page;

var loggedIn = false,
    userData = {};

module.exports = {

	name: "userbox",

    view: require("./userbox.html"),

    model: function(ractive) {

        if(loggedIn) {
            ractive.set("loggedIn", true);
            ractive.set("user", userData);
        } else {

            ractive.set("loggedIn", false);

            $.getJSON("/api/user")
            .then(function(data) {
                console.log("CURRENT USER", data);

                ractive.set("loggedIn", true);
                loggedIn = true;

                ractive.set("user", data);
                userData = data;
            });
        }   
        
        ractive.on('log_in', function() {
            page("/auth/google");
        });

        ractive.on('goto_account', function() {
            page("/user");
        });
    }
};