+(function ($, undefined) {

    'use strict';
    
    requirejs(["ractive", 
               "toastr",                
               "config/config.route",
               "scripts/templates",
               "engine/audio/audio"], function(Hogan, toastr, routingConfig, templates) {

         function route() {
             var currentRoute = location.hash.substring(1);
             
             if(routingConfig[currentRoute] !== undefined) {                 
                var currentRouteConfig = routingConfig[currentRoute];
                var template = templates[currentRouteConfig.template];
                var dummyData = {};
                var ractive = new Ractive({
                    el: "#stage",
                    template: template,
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
    
 })(jQuery, undefined);