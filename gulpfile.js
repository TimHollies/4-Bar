var gulp = require('gulp'),
    path = require('path'),
    jslint = require('gulp-jslint'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    ractive = require('./preprocess/precompile_templates'),
    browserify = require('gulp-browserify'),
    karma = require('karma').server;

gulp.task('default', ['watch']);

gulp.task('sass', function () {
    gulp.src('./app/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/styles'))
        .pipe(livereload());
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/config/karma.conf.js',
    singleRun: true
  }, done);
});

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('./app/app.js')
        .pipe(browserify({
            transform: ['ractivate', 'aliasify'],
          insertGlobals : true,
          debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./app/build'))
});

gulp.task('watch', function() {
    gulp.watch('./app/styles/*.scss', [ 'sass' ]);
    gulp.watch('app/**/*.htm', [ 'templates' ]);
});
