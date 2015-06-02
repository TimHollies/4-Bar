var gulp = require('gulp'),
    path = require('path'),
    webpack = require('gulp-webpack'),
    sourcemaps = require('gulp-sourcemaps');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var gutil = require('gulp-util');
var to5ify = require("6to5ify");

var file = require('gulp-file');

var ractive = require('ractive');
var _ = require('lodash');

var transformTools = require('browserify-transform-tools');
var toSource = require('tosource');
var livereload = require('gulp-livereload');

var aliasify = require('aliasify').configure({
    aliases: {
        "scripts": ".\\scripts",
        "engine": ".\\engine",
        "app": ".\\app",
        "vendor": ".\\engine\\vendor.js",
        "node_modules": ".\\node_modules"
    },
    configDir: __dirname,
    verbose: false
});

gulp.task('default', ['copyfonts', 'js']);

gulp.task('copyfonts', function() {
    gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}')
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('generate', function() {

    var str = "<!-- generated -->\n";

    var routeConfig = require('./app/routes');
    _.forOwn(routeConfig, function(val, key) {
        str += "{{#if url.pathname==='" + key + "'}}<" + val.name + "></" + val.name + ">{{/if}}\n"
    });
 
    return file('index.gen.html', str, { src: true }).pipe(gulp.dest('app'));
});

var bundler = watchify(browserify({
    debug: true
}));

bundler.add('./app/app.js');

bundler.transform(to5ify.configure({
  extensions: [".js"]
}));

bundler.transform(aliasify);

var options = {includeExtensions: [".html"]};
var rtransform = transformTools.makeStringTransform("ractivetransform", options,
    function (content, transformOptions, done) {

        done(null, "module.exports = " + toSource(ractive.parse(content)));
    });


bundler.transform(rtransform);

gulp.task('js', bundle);
bundler.on('update', bundle);

function bundle() {

    livereload.listen();

    console.log("Building Bundle!");
  var result =  bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you dont want sourcemaps
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./public'))
    .pipe(livereload());

    console.log("Done");
    return result;
}