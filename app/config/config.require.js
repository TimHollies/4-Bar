requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        angular: 'vendor/angular/angular',
        angular_route: 'vendor/angular-route/angular-route',
        angular_animate: 'vendor/angular-animate/angular-animate',
        jquery: 'vendor/jquery/dist/jquery',
        toastr: 'vendor/toastr/toastr',
        rx: 'vendor/rxjs/dist/rx',
        famous_angular: 'vendor/famous-angular/dist/famous-angular',
        famous: 'vendor/famous/famous-global'
    },

    shim: {
        angular_route: {
            deps: ['angular']
        },
        angular_animate: {
            deps: ['angular']
        },
        famous_angular: {
            deps: ['angular', 'famous']
        }
    }
});