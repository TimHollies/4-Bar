define([
    'vendor/rxjs/dist/rx',
    'engine/rxparser',
    'engine/parser/parser',
    'engine/renderer/render.script',
    'engine/transform/transpose',
    'engine/transform/preprocess',
    'app',
    'common/logger'
    ], function(Rx, ps, parser, abcrenderer, transpose, pre) {
        'use strict';
        var controllerId = 'home';
        angular.module('app').controller(controllerId, ['$scope', 'common', home]);

        function home($scope, common) {
            var getLogFn = common.logger.getLogFn;
            var log = getLogFn(controllerId);

            var vm = this;

            vm.title = 'Dashboard';
            vm.woop = 0;

            activate();

            vm.shiftChanged = function() {
                $scope.newValue = rerender($scope.name);
            }

            function positions(arr, width) {
                var multiplier = _(arr).foldl(function(a, b) {
                    return a + b;
                }, 0) / width;

                return _(arr).map(function(item) {
                    return item * multiplier;
                });
            }

            function rerender(data) {
                var parsedTune = parser.process(data);
                console.log(parsedTune);
            //parsedTune = pre.process(parsedTune);
            parsedTune = transpose.transpose(parsedTune, vm.woop);

            var titleNode = _(parsedTune).find(function(item) {
                return item.type === "header" && item.key === "T";
            });

            if (titleNode) {
                document.title = titleNode.data;
            } else {
                document.title = "Untitled";
            }

            parsedTune = abcrenderer.tuneToABC(parsedTune);

            return parsedTune;
        }

        function activate() {
            //console.log(expr.parse('3').value); // => 3
           // console.log(expr.parse('(add (mul 10 (add 3 4)) (add 7 8))').value);
            $scope.$parent.vm.sideBarContent = '/home/homeNav.html';

            var promises = [];
            common.activateController(promises, controllerId)
            .then(function() {

            });

        }

    }
});