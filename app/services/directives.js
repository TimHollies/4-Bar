define([
    'vendor/spinjs/spin.js',
    'app'
], function(Spinner) {
    'use strict';

    var app = angular.module('app');

    app.directive('ccScrollToTop', ['$window',
        // Usage:
        // <span data-cc-scroll-to-top></span>
        // Creates:
        // <span data-cc-scroll-to-top="" class="totop">
        //      <a href="#"><i class="fa fa-chevron-up"></i></a>
        // </span>
        function($window) {
            var directive = {
                link: link,
                template: '<a href="#"><i class="fa fa-chevron-up"></i></a>',
                restrict: 'A'
            };
            return directive;

            function link(scope, element, attrs) {
                var $win = $($window);
                element.addClass('totop');
                $win.scroll(toggleIcon);

                element.find('a').click(function(e) {
                    e.preventDefault();
                    // Learning Point: $anchorScroll works, but no animation
                    //$anchorScroll();
                    $('body').animate({
                        scrollTop: 0
                    }, 500);
                });

                function toggleIcon() {
                    $win.scrollTop() > 300 ? element.slideDown() : element.slideUp();
                }
            }
        }
    ]);

    app.directive('ccSpinner', ['$window',
        function($window) {
            // Description:
            //  Creates a new Spinner and sets its options
            // Usage:
            //  <div data-cc-spinner="vm.spinnerOptions"></div>
            var directive = {
                link: link,
                restrict: 'A'
            };
            return directive;

            function link(scope, element, attrs) {
                scope.spinner = null;
                scope.$watch(attrs.ccSpinner, function(options) {
                    if (scope.spinner) {
                        scope.spinner.stop();
                    }
                    scope.spinner = new Spinner(options);
                    scope.spinner.spin(element[0]);
                }, true);
            }
        }
    ]);

});