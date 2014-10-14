var gulp = require('gulp'),
    path = require('path'),
    mocha = require('gulp-mocha'),
    jslint = require('gulp-jslint'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass');

gulp.task('default', ['watch']);

gulp.task('sass', function () {
    gulp.src('./app/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/styles'))
        .pipe(livereload());
});

gulp.task('test', function() {
    return gulp.src('./test/*.js', {
            read: false
        })
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function() {
    gulp.watch('./app/engine/abc.peg', [ 'peg' ]);
    gulp.watch('./app/styles/*.scss', [ 'sass' ]);
});