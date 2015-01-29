'use strict';

require.ensure('vendor', function() {

    var
        Ractive = require('vendor').Ractive,
        routingConfig = require("../routes/config.route"),
        page = require('vendor').page,
        _ = require('vendor').lodash,
        domready = require('vendor').domready;

    domready(() => {

        function route(currentRoute, context) {

            if (routingConfig[currentRoute] !== undefined) {
                var currentRouteConfig = routingConfig[currentRoute];

                var dummyData = {};
                var partials = [];
                var partialviews = {};

                if (currentRouteConfig.partials !== undefined) {
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
            console.log("BAD");
        });

        //route();

        //window.onhashchange = route;

        page.start();

    });

});