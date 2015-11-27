var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");
var webpack = require('webpack-stream');

gulp.task('pre-test', function () {
  return gulp.src(['index.js', 'lib/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function() {
  return gulp.src('test/**/*.js', {read: false})
  .pipe(plumber())
  .pipe(mocha())
  // Creating the reports after tests ran
  .pipe(istanbul.writeReports())
  // Enforce a coverage of at least 90%
  .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
})

gulp.task('build', function() {
  return gulp.src('index.js')
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(rename("lx.js"))
  .pipe(gulp.dest('.'));
})

gulp.task('watch', function(){
	gulp.watch(['index.js', 'lib/**/*.js', 'test/**/*.js'], ['test', 'build']);
});

gulp.task('default', ['watch', 'test', 'build']);
