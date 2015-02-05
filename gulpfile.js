var gulp = require('gulp'),
    path = require('path'),
    sass = require('gulp-sass'),
    webpack = require('gulp-webpack'),
    sourcemaps = require('gulp-sourcemaps');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var gutil = require('gulp-util');
var to5ify = require("6to5ify");

var ractiveify = require('ractiveify');
var ractive = require('ractive');
var ractify = require('ractify');
var transformTools = require('browserify-transform-tools');
var toSource = require('tosource');
var livereload = require('gulp-livereload');
 
ractiveify.extensions.push('html', 'htm');

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

gulp.task('default', ['copyfonts', 'scripts', 'style-watch']);

gulp.task('sass', function () {
    gulp.src('./assets/styles/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public'));
});

gulp.task('scripts', function() {
    gulp.src('./app/app.js')
        .pipe(webpack(require('./config/webpack.config.js')))
        .pipe(gulp.dest('./public'));
});

gulp.task('copyfonts', function() {
    gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}')
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('watch', function() {
     livereload.listen();
    gulp.watch('./assets/styles/*.scss', [ 'sass' ]);
    gulp.watch('./app/**/*.js', [ 'scripts' ]);
    gulp.watch('./app/**/*.html', [ 'scripts' ]);
    gulp.watch('./engine/**/*.js', [ 'scripts' ]);
});

gulp.task('style-watch', function() {
    gulp.watch('./assets/styles/**/*.scss', [ 'sass' ]);
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

//bundler.transform({ extension: 'html' }, ractify);

//bundler.plugin('factor-bundle', { outputs: [ 'public/x.js', 'public/y.js', 'public/z.js'] });

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