'use strict';
console.log("NOT READY");

var consoleKeeper = console;

//require.ensure('vendor', function() {

console.log("ALMOST");

var
    Ractive = require('vendor').Ractive,
    routingConfig = require("./routes"),
    page = require('vendor').page,
    _ = require('vendor').lodash,
    domready = require('vendor').domready;

console = consoleKeeper;

console.log("ALMOST");

domready(() => {

    console.log("READY");

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

    //user stuff
    var loggedIn = false,
        userData = {};
    
    if(loggedIn) {
        ractive.set("loggedIn", true);
        ractive.set("user", userData);
    } else {

        ractive.set("loggedIn", false);


        fetch("/api/user")
        .then(function(response) {
            return response.json()
        }).then(function(data) {

            console.log("CURRENT USER", data);

            ractive.set("loggedIn", true);
            loggedIn = true;

            ractive.set("user", data);
            userData = data;

        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    }   
    
    ractive.on('*.log_in', function() {
        page("/auth/google");
    });

    ractive.on("*.navigate_to_page", function(urlToNavigateTo) {
        page(urlToNavigateTo);
    });

    //forcs the request to go to the server rather than the client
    page.serverMap = function(url) {
        page(url, function(context) {
            window.location = url;
        });
    }

    page.serverMap("/auth/google");
    page.serverMap("/logout");

    page('*', function(context) {
        console.log(context)
        //route(context.pathname.substr(1), context);
        ractive.set("url", context);
    });

    page.start();

});