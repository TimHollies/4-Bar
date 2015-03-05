var page = require('vendor').page;

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


            fetch("/api/user")
            .then(function(response) {
                return response.json()
            }).then(function(data) {

                if(data.failed === true) {
                    loggedIn = false;
                    return;
                }

                console.log("CURRENT USER", data);

                ractive.set("loggedIn", true);
                loggedIn = true;

                ractive.set("user", data);
                userData = data;

            }).catch(function(ex) {
                console.log('parsing failed', ex)
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