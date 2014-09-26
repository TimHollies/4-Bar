define([
    'engine/parser/parser',
    'engine/renderer/render.script',
    'engine/transform/transpose',
    'engine/transform/preprocess',
    'app',
    'common/logger'
], function(parser, abcrenderer, transpose, pre) {
    'use strict';
    var controllerId = 'editor';
    angular.module('app').controller(controllerId, ['$scope', 'common', editor]);

    function editor($scope, common) {
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

                $("#sideBar").animate({
                    width: "640px"
                }, 200);

                $(".searchHeader").animate({
                     top: -100
                }, 200);

                $scope.$parent.vm.sideBarContent = '/editor/editorNav.html';

            var promises = [];
            common.activateController(promises, controllerId)
                .then(function() {
                });
/*
            observeOnScope($scope, 'name').subscribe(function(change) {
                $scope.observedChange = change;
                if (change.newValue != undefined) {
                    try {
                        $scope.newValue = rerender(change.newValue);
                    } catch (err) {
                        console.log(err);
                        $scope.newValue = err;
                    }

                }
                $scope.oldValue = change.oldValue;
            });*/
        }

    }
});