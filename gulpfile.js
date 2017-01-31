"use strict";

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del');

var DIST = 'dist';
var DIST_NAME = 'angular-spa-auth.min.js';

var JS = [
    'src/**/*.js'
];

gulp.task('concat', function () {
    return gulp.src(JS, {base: 'app'})
        .pipe(concat(DIST_NAME))
        .pipe(uglify())
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