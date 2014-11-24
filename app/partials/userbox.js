var $ = require('vendor').jquery,
page = require('vendor').page;

module.exports = {

	name: "userbox",

    view: require("./userbox.html"),

    model: function(ractive) {

        ractive.set("loggedIn", false);

        $.getJSON("/api/user/current")
            .then(function(data) {
                console.log("CURRENT USER", data);
                ractive.set("loggedIn", true);
                ractive.set("user", data);
            });

        ractive.on('log_in', function() {
            page("/auth/google");
        });

        ractive.on('goto_account', function() {
            page("/user");
        });
    }
};