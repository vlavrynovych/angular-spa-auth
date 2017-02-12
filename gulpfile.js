"use strict";

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    del = require('del'),
    Server = require('karma').Server;

var DIST = 'dist';
var DIST_NAME = 'angular-spa-auth.js';

var JS = [
    'src/**/*.js'
];

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('concat', function () {
    return gulp.src(JS, {base: 'app'})
        .pipe(sourcemaps.init())
        .pipe(concat(DIST_NAME))
        .pipe(gulp.dest(DIST))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST));
});

gulp.task('clean', function () {
    return del(DIST + '/*');
});

gulp.task('watch', function () {
    gulp.watch(JS, gulp.series('build'));
});

gulp.task('build', gulp.series('clean', 'concat'));

gulp.task('buildAndTest', gulp.series('clean', 'concat', 'test'));

gulp.task('default', gulp.series('build', 'watch'));