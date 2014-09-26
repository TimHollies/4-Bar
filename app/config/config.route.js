define([
    'app'
], function() {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);

    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function(r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }

    // Define the routes 
    function getRoutes() {
        return [{
            url: '/',
            config: {
                templateUrl: 'home/home.html',
                title: 'dashboard',
                settings: {
                    nav: 1,
                    content: '<i class="fa fa-dashboard"></i> Dashboard',
                }
            }
        },
        {
            url: '/editor',
            config: {
                templateUrl: 'editor/editor.html',
                title: 'editor',
                settings: {
                    nav: 1,
                    content: '<i class="fa fa-dashboard"></i> Dashboard'
                }
            }
        }]
    }
});