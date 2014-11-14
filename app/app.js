'use strict';

require.ensure('vendor', function() {

    var
        Ractive = require('vendor').Ractive,
        toastr = require('vendor').toastr,
        routingConfig = require("../routes/config.route"),
        page = require('vendor').page,
        $ = require('vendor').jquery;

    $(document).ready(function() {
        //audio = require("./engine/audio/audio");

        function route(currentRoute, context) {

            if (routingConfig[currentRoute] !== undefined) {
                var currentRouteConfig = routingConfig[currentRoute];

                var dummyData = {};
                var ractive = new Ractive({
                    el: "#stage",
                    template: currentRouteConfig.template,
                    data: dummyData,
                    lazy: false
                });

                currentRouteConfig.model(ractive, dummyData, page, context);

            } else {
                toastr.error("No route found in lookup");
            }
        }

        //forcs the request to go to the server rather than the client
        page.serverMap = function(url) {
            page(url, function(context) {
                window.location = url;
            });
        }

        page('', function(context) {
            route("", context);
        });

        page('/editor', function(context) {
            route("editor", context);
        });

        page('editor/:tuneid', function(context) {
            route("editor", context);
        });

        page.serverMap("/auth/google");
        page.serverMap("/logout");

        page('*', function(context) {
            toastr.error("No route found");
        });

        //route();

        //window.onhashchange = route;

        page.start();

    });

});