var browserify = require('browserify');
var watchify = require('watchify');

var aliasify = require('aliasify').configure({
    aliases: {
        "scripts": ".\\engine\\scripts",
        "engine": ".\\engine",
        "app": ".\\app",
        "vendor": ".\\engine\\vendor.js"
    },
    configDir: __dirname,
    verbose: false
});

var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true
});

b = watchify(b);

b.on('update', function(){
    b.bundle().pipe(process.stdout);
});

b.add('./experiments/diff.js');