var gulp = require('gulp'),
    path = require('path'),
    jslint = require('gulp-jslint'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    webpack = require('gulp-webpack'),
    WebpackDevServer = require("webpack-dev-server");

gulp.task('default', ['copyfonts', 'scripts', 'sass']);

gulp.task('sass', function () {
    gulp.src('./assets/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./public'));
});

gulp.task('scripts', function() {
    gulp.src('./app/app.js')
        .pipe(webpack(require('./config/webpack.config.js')))
        .pipe(gulp.dest('./public'))
        .pipe(livereload());
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