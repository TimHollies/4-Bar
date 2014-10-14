+(function ($, undefined) {

    'use strict';
    
    requirejs(["ractive", 
               "toastr",                
               "config/config.route","engine/audio/audio"], function(Hogan, toastr, routingConfig) {

         var cache = {};

         function getHoganTemplate(name) {
             var promise = new Promise(function(resolve, reject) {
                 if (cache[name] !== undefined) {
                     resolve(cache[name]);
                 } else {
                     $.get(name, function(response) {
                         var template = Hogan.parse(response);
                         cache[name] = template;
                         resolve(template);
                     });
                 }
             });

             return promise;
         }      

         function route() {
             var currentRoute = location.hash.substring(1);
             
             if(routingConfig[currentRoute] !== undefined) {                 
                var currentRouteConfig = routingConfig[currentRoute];
                getHoganTemplate(currentRouteConfig.template)
                .then(function(template) {
                    var dummyData = {};
                    var ractive = new Ractive({
                      el: "#stage",
                      template: template,
                      data: dummyData,
                      lazy: false
                    });
                    
                    currentRouteConfig.model(ractive, dummyData);   
                });
             } else {
                toastr.error("No route found");
             }
         }

         route();

         window.onhashchange = route;       
        
     });
    
 })(jQuery, undefined);