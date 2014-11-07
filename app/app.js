+(function($, undefined) {

    'use strict';

    require.ensure('vendor', function() {
        $(document).ready(function() {
            var
                Ractive = require('vendor').Ractive,
                toastr = require('vendor').toastr,
                routingConfig = require("../routes/config.route");
            //audio = require("./engine/audio/audio");

            function route() {
                var currentRoute = location.hash.substring(1);

                if (routingConfig[currentRoute] !== undefined) {
                    var currentRouteConfig = routingConfig[currentRoute];

                    var dummyData = {};
                    var ractive = new Ractive({
                        el: "#stage",
                        template: currentRouteConfig.template,
                        data: dummyData,
                        lazy: false
                    });

                    currentRouteConfig.model(ractive, dummyData);

                } else {
                    toastr.error("No route found");
                }
            }

            route();

            window.onhashchange = route;

        });

    });




})(require('jquery'), undefined);