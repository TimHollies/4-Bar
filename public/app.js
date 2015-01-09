webpackJsonp([0,2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__.e/*nsure*/(1, function() {
	
	    var
	        Ractive = __webpack_require__(1).Ractive,
	        toastr = __webpack_require__(1).toastr,
	        routingConfig = __webpack_require__(2),
	        page = __webpack_require__(1).page,
	        $ = __webpack_require__(1).jquery,
	        _ = __webpack_require__(1).lodash;
	
	    $(document).ready(function() {
	        //audio = require("./engine/audio/audio");
	
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

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsSUFBSTtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7O0FBRWpCOztBQUVBO0FBQ0E7QUFDQSxrQkFBaUI7O0FBRWpCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxNQUFLOztBQUVMLEVBQUMsRSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbnJlcXVpcmUuZW5zdXJlKCd2ZW5kb3InLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXJcclxuICAgICAgICBSYWN0aXZlID0gcmVxdWlyZSgndmVuZG9yJykuUmFjdGl2ZSxcclxuICAgICAgICB0b2FzdHIgPSByZXF1aXJlKCd2ZW5kb3InKS50b2FzdHIsXHJcbiAgICAgICAgcm91dGluZ0NvbmZpZyA9IHJlcXVpcmUoXCIuLi9yb3V0ZXMvY29uZmlnLnJvdXRlXCIpLFxyXG4gICAgICAgIHBhZ2UgPSByZXF1aXJlKCd2ZW5kb3InKS5wYWdlLFxyXG4gICAgICAgICQgPSByZXF1aXJlKCd2ZW5kb3InKS5qcXVlcnksXHJcbiAgICAgICAgXyA9IHJlcXVpcmUoJ3ZlbmRvcicpLmxvZGFzaDtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2F1ZGlvID0gcmVxdWlyZShcIi4vZW5naW5lL2F1ZGlvL2F1ZGlvXCIpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByb3V0ZShjdXJyZW50Um91dGUsIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3V0aW5nQ29uZmlnW2N1cnJlbnRSb3V0ZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3V0ZUNvbmZpZyA9IHJvdXRpbmdDb25maWdbY3VycmVudFJvdXRlXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZHVtbXlEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFydGlhbHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWFsdmlld3MgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJvdXRlQ29uZmlnLnBhcnRpYWxzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFscyA9IGN1cnJlbnRSb3V0ZUNvbmZpZy5wYXJ0aWFscztcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsdmlld3MgPSBwYXJ0aWFscy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhW2IubmFtZV0gPSBiLnZpZXc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHt9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgICAgICAgICAgICAgICBlbDogXCIjc3RhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY3VycmVudFJvdXRlQ29uZmlnLnRlbXBsYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGR1bW15RGF0YSxcclxuICAgICAgICAgICAgICAgICAgICBsYXp5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsczogcGFydGlhbHZpZXdzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Um91dGVDb25maWcubW9kZWwocmFjdGl2ZSwgZHVtbXlEYXRhLCBwYWdlLCBjb250ZXh0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBfKHBhcnRpYWxzKS5lYWNoKGZ1bmN0aW9uKHBhcnRpYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLm1vZGVsKHJhY3RpdmUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiTm8gcm91dGUgZm91bmQgaW4gbG9va3VwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2ZvcmNzIHRoZSByZXF1ZXN0IHRvIGdvIHRvIHRoZSBzZXJ2ZXIgcmF0aGVyIHRoYW4gdGhlIGNsaWVudFxyXG4gICAgICAgIHBhZ2Uuc2VydmVyTWFwID0gZnVuY3Rpb24odXJsKSB7XHJcbiAgICAgICAgICAgIHBhZ2UodXJsLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSB1cmw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFnZSgnJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcIlwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZSgnL2VkaXRvcicsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgcm91dGUoXCJlZGl0b3JcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJy91c2VyJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcInVzZXJcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJy92aWV3ZXInLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwidmlld2VyXCIsIGNvbnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYWdlKCcvdmlld2VyLzp0dW5laWQnLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwidmlld2VyXCIsIGNvbnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYWdlKCcvdHV0b3JpYWwnLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwidHV0b3JpYWxcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJ2VkaXRvci86dHVuZWlkJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcImVkaXRvclwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZS5zZXJ2ZXJNYXAoXCIvYXV0aC9nb29nbGVcIik7XHJcbiAgICAgICAgcGFnZS5zZXJ2ZXJNYXAoXCIvbG9nb3V0XCIpO1xyXG5cclxuICAgICAgICBwYWdlKCcqJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJObyByb3V0ZSBmb3VuZFwiKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9yb3V0ZSgpO1xyXG5cclxuICAgICAgICAvL3dpbmRvdy5vbmhhc2hjaGFuZ2UgPSByb3V0ZTtcclxuXHJcbiAgICAgICAgcGFnZS5zdGFydCgpO1xyXG5cclxuICAgICAgICB0b2FzdHIub3B0aW9ucy5wb3NpdGlvbkNsYXNzID0gXCJ0b2FzdC1ib3R0b20tcmlnaHRcIjtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9hcHAvYXBwLmpzXG4gKiogbW9kdWxlIGlkID0gMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiYXBwLmpzIn0=