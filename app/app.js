define([
    'angular',
    'angular_route',
   // 'rx_angular'
], function() {
    'use strict';

    var app = angular.module('app', [
        // Angular modules 
        'ngRoute', // routing
        //'ngSanitize', // sanitizes html bindings (ex: sidebar.js)

        // Custom modules 
        'common', // common functions, logger, spinner
        //'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        //'ui.bootstrap' // ui-bootstrap (ex: carousel, pagination, dialog)
        //'rx'
    ]);

    // Handle routing errors and success events
    app.run(['$route',
        function($route) {
            // Include $route to kick start the router.
        }
    ]);
});