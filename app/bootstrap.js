+(function() {
    requirejs([
        'config/config.route',
        'services/directives',
        'layout/shell',
        'home/home',
        'editor/editor',
        'config/config.exceptionHandler'
    ], function() {
        angular.bootstrap(document, ['app']);
    });
})();