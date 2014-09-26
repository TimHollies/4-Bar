var gulp = require('gulp'),
    path = require('path'),
    jison = require('gulp-jison'),
    mocha = require('gulp-mocha'),
    less = require('gulp-less'),
    jslint = require('gulp-jslint');

gulp.task('default', ['jison', 'test', 'watch']);

gulp.task('jison', function() {
    return gulp.src('./app/engine/parser/*.jison')
        .pipe(jison({
            moduleType: 'amd'
        }))
        .pipe(gulp.dest('./app/engine/parser'));
});

gulp.task('less', function () {
  gulp.src('./app/style/site.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./app/style'));
});

gulp.task('test', function() {
    return gulp.src('./test/*.js', {
            read: false
        })
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function() {
    gulp.watch('./app/engine/parser*.jison', ['jison']);
});

gulp.task('watchStyle', function() {
    gulp.watch('./app/style/*.less', ['less']);
});

// build the main source into the min file
gulp.task('lint', function () {
    return gulp.src(['./app/engine/*.js'])

        // pass your directives
        // as an object
        .pipe(jslint({
            // these directives can
            // be found in the official
            // JSLint documentation.
            node: true,
            evil: true,
            nomen: true,

            // pass in your prefered
            // reporter like so:
            reporter: 'default',
            // ^ there's no need to tell gulp-jslint
            // to use the default reporter. If there is
            // no reporter specified, gulp-jslint will use
            // its own.

            // specify whether or not
            // to show 'PASS' messages
            // for built-in reporter
            errorsOnly: false
        }))

        // error handling:
        // to handle on error, simply
        // bind yourself to the error event
        // of the stream, and use the only
        // argument as the error object
        // (error instanceof Error)
        .on('error', function (error) {
            console.error(String(error));
        });
});