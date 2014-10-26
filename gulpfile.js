var gulp = require('gulp'),
    path = require('path'),
    jslint = require('gulp-jslint'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    ractive = require('./preprocess/precompile_templates');

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

gulp.task('templates', function() {
    gulp.src('app/**/*.htm')
        .pipe(ractive('templates.js'))
        .pipe(gulp.dest('./app/scripts'));
});

gulp.task('watch', function() {
    gulp.watch('./app/styles/*.scss', [ 'sass' ]);
    gulp.watch('app/**/*.htm', [ 'templates' ]);
});
