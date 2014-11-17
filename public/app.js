webpackJsonp([0,2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__.e/*nsure*/(1, function() {
	
	    var
	        Ractive = __webpack_require__(4).Ractive,
	        toastr = __webpack_require__(4).toastr,
	        routingConfig = __webpack_require__(1),
	        page = __webpack_require__(4).page,
	        $ = __webpack_require__(4).jquery;
	
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

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjs7QUFFakI7O0FBRUEsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTOztBQUVUOztBQUVBOztBQUVBOztBQUVBLE1BQUs7O0FBRUwsRUFBQyxFIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxucmVxdWlyZS5lbnN1cmUoJ3ZlbmRvcicsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhclxyXG4gICAgICAgIFJhY3RpdmUgPSByZXF1aXJlKCd2ZW5kb3InKS5SYWN0aXZlLFxyXG4gICAgICAgIHRvYXN0ciA9IHJlcXVpcmUoJ3ZlbmRvcicpLnRvYXN0cixcclxuICAgICAgICByb3V0aW5nQ29uZmlnID0gcmVxdWlyZShcIi4uL3JvdXRlcy9jb25maWcucm91dGVcIiksXHJcbiAgICAgICAgcGFnZSA9IHJlcXVpcmUoJ3ZlbmRvcicpLnBhZ2UsXHJcbiAgICAgICAgJCA9IHJlcXVpcmUoJ3ZlbmRvcicpLmpxdWVyeTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2F1ZGlvID0gcmVxdWlyZShcIi4vZW5naW5lL2F1ZGlvL2F1ZGlvXCIpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByb3V0ZShjdXJyZW50Um91dGUsIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb3V0aW5nQ29uZmlnW2N1cnJlbnRSb3V0ZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3V0ZUNvbmZpZyA9IHJvdXRpbmdDb25maWdbY3VycmVudFJvdXRlXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZHVtbXlEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICB2YXIgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgICAgICAgICAgICAgICBlbDogXCIjc3RhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY3VycmVudFJvdXRlQ29uZmlnLnRlbXBsYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGR1bW15RGF0YSxcclxuICAgICAgICAgICAgICAgICAgICBsYXp5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvdXRlQ29uZmlnLm1vZGVsKHJhY3RpdmUsIGR1bW15RGF0YSwgcGFnZSwgY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiTm8gcm91dGUgZm91bmQgaW4gbG9va3VwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2ZvcmNzIHRoZSByZXF1ZXN0IHRvIGdvIHRvIHRoZSBzZXJ2ZXIgcmF0aGVyIHRoYW4gdGhlIGNsaWVudFxyXG4gICAgICAgIHBhZ2Uuc2VydmVyTWFwID0gZnVuY3Rpb24odXJsKSB7XHJcbiAgICAgICAgICAgIHBhZ2UodXJsLCBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSB1cmw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFnZSgnJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcIlwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZSgnL2VkaXRvcicsIGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgcm91dGUoXCJlZGl0b3JcIiwgY29udGV4dCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBhZ2UoJ2VkaXRvci86dHVuZWlkJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICByb3V0ZShcImVkaXRvclwiLCBjb250ZXh0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFnZS5zZXJ2ZXJNYXAoXCIvYXV0aC9nb29nbGVcIik7XHJcbiAgICAgICAgcGFnZS5zZXJ2ZXJNYXAoXCIvbG9nb3V0XCIpO1xyXG5cclxuICAgICAgICBwYWdlKCcqJywgZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJObyByb3V0ZSBmb3VuZFwiKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9yb3V0ZSgpO1xyXG5cclxuICAgICAgICAvL3dpbmRvdy5vbmhhc2hjaGFuZ2UgPSByb3V0ZTtcclxuXHJcbiAgICAgICAgcGFnZS5zdGFydCgpO1xyXG5cclxuICAgIH0pO1xyXG5cclxufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2FwcC9hcHAuanNcbiAqKiBtb2R1bGUgaWQgPSAwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJhcHAuanMifQ==