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

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsSUFBSTtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7O0FBRWpCOztBQUVBO0FBQ0E7QUFDQSxrQkFBaUI7O0FBRWpCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxNQUFLOztBQUVMLEVBQUMsRSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbnJlcXVpcmUuZW5zdXJlKCd2ZW5kb3InLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXJcclxuICAgICAgICBSYWN0aXZlID0gcmVxdWlyZSgndmVuZG9yJykuUmFjdGl2ZSxcclxuICAgICAgICB0b2FzdHIgPSByZXF1aXJlKCd2ZW5kb3InKS50b2FzdHIsXHJcbiAgICAgICAgcm91dGluZ0NvbmZpZyA9IHJlcXVpcmUoXCIuLi9yb3V0ZXMvY29uZmlnLnJvdXRlXCIpLFxyXG4gICAgICAgIHBhZ2UgPSByZXF1aXJlKCd2ZW5kb3InKS5wYWdlLFxyXG4gICAgICAgICQgPSByZXF1aXJlKCd2ZW5kb3InKS5qcXVlcnksXHJcbiAgICAgICAgXyA9IHJlcXVpcmUoJ3ZlbmRvcicpLmxvZGFzaDtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2F1ZGlvID0gcmVxdWlyZShcIi4vZW5naW5lL2F1ZGlvL2F1ZGlvXCIpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByb3V0ZShjdXJyZW50Um91dGUsIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3V0aW5nQ29uZmlnW2N1cnJlbnRSb3V0ZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3V0ZUNvbmZpZyA9IHJvdXRpbmdDb25maWdbY3VycmVudFJvdXRlXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZHVtbXlEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFydGlhbHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWFsdmlld3MgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Um91dGVDb25maWcucGFydGlhbHMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWxzID0gY3VycmVudFJvdXRlQ29uZmlnLnBhcnRpYWxzO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWx2aWV3cyA9IHBhcnRpYWxzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFbYi5uYW1lXSA9IGIudmlldztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwge30pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsOiBcIiNzdGFnZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjdXJyZW50Um91dGVDb25maWcudGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZHVtbXlEYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhenk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWxzOiBwYXJ0aWFsdmlld3NcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3V0ZUNvbmZpZy5tb2RlbChyYWN0aXZlLCBkdW1teURhdGEsIHBhZ2UsIGNvbnRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIF8ocGFydGlhbHMpLmVhY2goZnVuY3Rpb24ocGFydGlhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWwubW9kZWwocmFjdGl2ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJObyByb3V0ZSBmb3VuZCBpbiBsb29rdXBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZm9yY3MgdGhlIHJlcXVlc3QgdG8gZ28gdG8gdGhlIHNlcnZlciByYXRoZXIgdGhhbiB0aGUgY2xpZW50XHJcbiAgICAgICAgcGFnZS5zZXJ2ZXJNYXAgPSBmdW5jdGlvbih1cmwpIHtcclxuICAgICAgICAgICAgcGFnZSh1cmwsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHVybDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYWdlKCcnLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwiXCIsIGNvbnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYWdlKCcvZWRpdG9yJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcImVkaXRvclwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZSgnL3VzZXInLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwidXNlclwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZSgnL3ZpZXdlcicsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgcm91dGUoXCJ2aWV3ZXJcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJy92aWV3ZXIvOnR1bmVpZCcsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgcm91dGUoXCJ2aWV3ZXJcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJy90dXRvcmlhbCcsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgcm91dGUoXCJ0dXRvcmlhbFwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZSgnZWRpdG9yLzp0dW5laWQnLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHJvdXRlKFwiZWRpdG9yXCIsIGNvbnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYWdlLnNlcnZlck1hcChcIi9hdXRoL2dvb2dsZVwiKTtcclxuICAgICAgICBwYWdlLnNlcnZlck1hcChcIi9sb2dvdXRcIik7XHJcblxyXG4gICAgICAgIHBhZ2UoJyonLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihcIk5vIHJvdXRlIGZvdW5kXCIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3JvdXRlKCk7XHJcblxyXG4gICAgICAgIC8vd2luZG93Lm9uaGFzaGNoYW5nZSA9IHJvdXRlO1xyXG5cclxuICAgICAgICBwYWdlLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIHRvYXN0ci5vcHRpb25zLnBvc2l0aW9uQ2xhc3MgPSBcInRvYXN0LWJvdHRvbS1yaWdodFwiO1xyXG5cclxuICAgIH0pO1xyXG5cclxufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2FwcC9hcHAuanNcbiAqKiBtb2R1bGUgaWQgPSAwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJhcHAuanMifQ==