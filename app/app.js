'use strict';

require.ensure('vendor', function() {

    var
        Ractive = require('vendor').Ractive,
        toastr = require('vendor').toastr,
        routingConfig = require("../routes/config.route"),
        page = require('vendor').page,
        $ = require('vendor').jquery,
        _ = require('vendor').lodash;

    $(document).ready(function() {
        //audio = require("./engine/audio/audio");

        function route(currentRoute, context) {

            if (routingConfig[currentRoute] !== undefined) {
                var currentRouteConfig = routingConfig[currentRoute];

                var dummyData = {};
                var partials = [];
                var partialviews = {};

                if(currentRouteConfig.partials !== undefined) {
                    partials = currentRouteConfig.partials;
                    partialviews = partials.reduce(function(a, b) {
                        a[b.name] = b.view;
                        return a;
                    }, {});
                }

                var ractive = new Ractive({
                    el: "#stage",
                    template: currentRouteConfig.template,
                    data: dummyData,
                    lazy: false,
                    partials: partialviews
                });

                currentRouteConfig.model(ractive, dummyData, page, context);

                _(partials).each(function(partial) {
                    partial.model(ractive);
                });

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

        page('/user', function(context) {
            route("user", context);
        });

        page('/viewer', function(context) {
            route("viewer", context);
        });

        page('/viewer/:tuneid', function(context) {
            route("viewer", context);
        });

        page('/tutorial', function(context) {
            route("tutorial", context);
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

        toastr.options.positionClass = "toast-bottom-right";

    });

});