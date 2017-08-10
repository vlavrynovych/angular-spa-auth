"use strict";

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    del = require('del');

var DIST = 'dist';
var DIST_NAME = 'angular-spa-auth.js';

var JS = [
    'src/**/*.js',
    'node_modules/string.prototype.startswith/startswith.js'
];

gulp.task('concat', function () {
    return gulp.src(JS, {base: 'app'})
        .pipe(sourcemaps.init())
        .pipe(concat(DIST_NAME))
        .pipe(gulp.dest(DIST))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(DIST));
});

gulp.task('clean', function () {
    return del(DIST + '/*');
});

gulp.task('watch', function () {
    gulp.watch(JS, gulp.series('build'));
});

gulp.task('build', gulp.series('clean', 'concat'));

gulp.task('default', gulp.series('build', 'watch'));