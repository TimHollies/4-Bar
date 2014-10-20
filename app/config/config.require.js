requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: 'vendor/jquery/dist/jquery',
        ractive: 'vendor/ractive/ractive',
        rx: 'vendor/rxjs/dist/rx.all',
        toastr: 'vendor/toastr/toastr',
        lodash: 'vendor/lodash/dist/lodash',
        midijs: 'scripts/midi.js/MIDI',
        svgjs: 'vendor/svgjs/svg',
        jsDiff: 'vendor/jsdiff/diff'
    },
    urlArgs: 'now=' + Date.now(),
    shim: {
        midijs: {
            deps: ['scripts/midi.js/base64binary']
        }
    }
});