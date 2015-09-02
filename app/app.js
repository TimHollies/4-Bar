'use strict';

var consoleKeeper = console;

var
    Ractive = require('vendor').Ractive,
    routingConfig = require("./routes"),
    page = require('vendor').page,
    _ = require('vendor').lodash,
    domready = require('vendor').domready;

console = consoleKeeper;

domready(() => {

    var components = {};

    _.forOwn(routingConfig, function (val, key) {
        components[val.name] = val.model;
    });

    var ractive = new Ractive({
        el: "#stage",
        template: require("app/index.gen.html"),
        data: {
            url: ""
        },
        lazy: false,
        partials: {
            userbox: require("app/partials/userbox.html")
        },
        components: components
    });

    window.addEventListener("popstate", function() {
        console.log("CHANGE");
    });

    //user stuff
    var loggedIn = false,
        userData = {};

    ractive.on("*.navigate_to_page", function(urlToNavigateTo) {
        page(urlToNavigateTo);
    });

    //forces the request to go to the server rather than the client
    page.serverMap = function(url) {
        page(url, function(context) {
            window.location = url;
        });
    }

    page.serverMap("/auth/google");
    page.serverMap("/pdf");
    page.serverMap("/logout");

    page('*', function(context) {
        console.log(context)
        ractive.set("url", context);
    });

    page.start();

});